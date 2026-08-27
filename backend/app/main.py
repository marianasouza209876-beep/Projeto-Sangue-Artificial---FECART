import uvicorn
import re
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from .database import engine, SessionLocal, init_db, Lote, LeituraSensor, TrilhaAuditoria
from .processing import processar_leituras
from .ai_model import analisar_risco_ia
from .translator import responder_pergunta_cientifica

app = FastAPI(title="Flowtificial API - Sangue Artificial Inteligente")

# Configuração de CORS completa
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Libera todas as origens
    allow_credentials=True,
    allow_methods=["*"], # Libera todos os métodos HTTP (GET, POST, etc.)
    allow_headers=["*"], # Libera todos os headers
)

# Inicializar o banco de dados na inicialização da aplicação
@app.on_event("startup")
def startup_event():
    init_db()

# Dependência para obter sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MODELOS PYDANTIC ---
class SensorDataInput(BaseModel):
    lote_id: str
    oxigenacao: str
    temperatura: str
    vazao: str

import datetime

class LoteCreate(BaseModel):
    id: str
    nome: Optional[str] = None
    data_criacao: Optional[str] = None
    finalidade: Optional[str] = None
    composicao: Optional[str] = "Composto de Sangue Artificial Customizado"
    status_inicial: Optional[str] = "ESTÁVEL"

class ChatInput(BaseModel):
    pergunta: str

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "FastAPI Biomédico Flowtificial Ativo"}

@app.post("/api/sensor-data")
def receive_sensor_data(data: SensorDataInput, db: Session = Depends(get_db)):
    # 1. Verificar se o lote existe, senão cria automaticamente
    lote_id_clean = data.lote_id.strip().upper()
    lote = db.query(Lote).filter(Lote.id == lote_id_clean).first()
    if not lote:
        lote = Lote(id=lote_id_clean, status_inicial="ESTÁVEL", composicao="Composto de Sangue Artificial Auto-registrado")
        db.add(lote)
        db.commit()
        
        # Log da criação de lote automático
        db.add(TrilhaAuditoria(
            modulo="Dados",
            acao="Lote Auto-Registrado",
            descricao=f"Lote {lote_id_clean} criado automaticamente ao receber dados de sensor.",
            operador="Hardware Bridge"
        ))
        db.commit()
    
    # 2. Camada de Processamento: Limpar e normalizar
    processado = processar_leituras(
        ox_bruto=data.oxigenacao,
        temp_bruto=data.temperatura,
        vazao_bruto=data.vazao
    )
    
    # 3. Camada de IA Explicável: Analisar risco com base nas leituras processadas
    analise_ia = analisar_risco_ia(
        ox=processado["oxigenacao_limpa"],
        temp=processado["temperatura_c"],
        vazao=processado["vazao_l_min"],
        ph=processado["ph"],
        viscosidade=processado["viscosidade_cp"],
        hematocrito=processado["hematocrito_pct"]
    )
    
    # Atualizar o status geral da leitura com o veredito da IA
    status_final = analise_ia["nivel_risco"]
    alerta_final = analise_ia["justificativa_geral"]
    
    # 4. Salvar leitura na Camada de Dados
    nova_leitura = LeituraSensor(
        lote_id=lote_id_clean,
        oxigenacao_bruta=str(data.oxigenacao),
        temperatura_bruta=str(data.temperatura),
        vazao_bruta=str(data.vazao),
        oxigenacao_limpa=processado["oxigenacao_limpa"],
        temperatura_c=processado["temperatura_c"],
        vazao_l_min=processado["vazao_l_min"],
        ph=processado["ph"],
        viscosidade_cp=processado["viscosidade_cp"],
        hematocrito_pct=processado["hematocrito_pct"],
        status=status_final,
        alerta_mensagem=alerta_final
    )
    db.add(nova_leitura)
    db.commit()
    
    # Gravar na Trilha de Auditoria
    audit_desc = f"Processado e auditado Lote {lote_id_clean}. Risco: {analise_ia['risco_degradacao_pct']}% Status: {status_final}."
    db.add(TrilhaAuditoria(
        modulo="Processamento",
        acao="Leitura Processada",
        descricao=audit_desc,
        operador="Hardware Bridge"
    ))
    db.commit()
    
    return {
        "success": True,
        "data": {
            "lote_id": lote_id_clean,
            "processado": processado,
            "ia_explicavel": analise_ia
        }
    }

@app.get("/api/lots")
def get_lots(db: Session = Depends(get_db)):
    lotes = db.query(Lote).all()
    # Para cada lote, obter o status da última leitura
    resultado = []
    for l in lotes:
        ultima_leitura = db.query(LeituraSensor).filter(LeituraSensor.lote_id == l.id).order_by(LeituraSensor.timestamp.desc()).first()
        status_atual = ultima_leitura.status if ultima_leitura else l.status_inicial
        resultado.append({
            "id": l.id,
            "nome": l.nome or f"Lote {l.id}",
            "name": l.nome or f"Lote {l.id}",
            "data_criacao": l.data_criacao.strftime("%d/%m/%Y %H:%M:%S") if l.data_criacao else "",
            "createdAt": l.data_criacao.strftime("%d/%m/%Y %H:%M:%S") if l.data_criacao else "",
            "finalidade": l.finalidade or "Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)",
            "destino": l.finalidade or "Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)",
            "composicao": l.composicao,
            "status": status_atual
        })
    return resultado

@app.post("/api/lots")
def create_lot(lote_in: LoteCreate, db: Session = Depends(get_db)):
    lote_id_clean = lote_in.id.strip().upper()
    existente = db.query(Lote).filter(Lote.id == lote_id_clean).first()
    if existente:
        raise HTTPException(status_code=400, detail="Lote já cadastrado.")
    
    dt = datetime.datetime.now()
    if lote_in.data_criacao:
        try:
            dt = datetime.datetime.fromisoformat(lote_in.data_criacao.replace("Z", "+00:00"))
        except Exception:
            pass

    novo_lote = Lote(
        id=lote_id_clean,
        nome=lote_in.nome or f"Lote {lote_id_clean}",
        data_criacao=dt,
        finalidade=lote_in.finalidade or "Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)",
        composicao=lote_in.composicao,
        status_inicial=lote_in.status_inicial
    )
    db.add(novo_lote)
    db.commit()
    
    db.add(TrilhaAuditoria(
        modulo="Dados",
        acao="Criação de Lote",
        descricao=f"Novo lote {lote_id_clean} ({novo_lote.nome}) cadastrado. Finalidade: {novo_lote.finalidade}.",
        operador="Pesquisador Biomédico"
    ))
    db.commit()
    
    return {
        "success": True, 
        "lote": {
            "id": novo_lote.id, 
            "nome": novo_lote.nome,
            "name": novo_lote.nome,
            "data_criacao": novo_lote.data_criacao.strftime("%d/%m/%Y %H:%M:%S") if novo_lote.data_criacao else "",
            "createdAt": novo_lote.data_criacao.strftime("%d/%m/%Y %H:%M:%S") if novo_lote.data_criacao else "",
            "finalidade": novo_lote.finalidade,
            "destino": novo_lote.finalidade,
            "composicao": novo_lote.composicao
        }
    }

@app.get("/api/history/{lote_id}")
def get_lot_history(lote_id: str, limit: int = 20, db: Session = Depends(get_db)):
    lote_id_clean = lote_id.strip().upper()
    leituras = db.query(LeituraSensor).filter(LeituraSensor.lote_id == lote_id_clean).order_by(LeituraSensor.timestamp.asc()).all()
    # Retornar as últimas 'limit' leituras
    return leituras[-limit:]

@app.get("/api/audits")
def get_audits(limit: int = 15, db: Session = Depends(get_db)):
    audits = db.query(TrilhaAuditoria).order_by(TrilhaAuditoria.timestamp.desc()).limit(limit).all()
    return audits

@app.post("/api/chat")
def chatbot_interaction(chat_in: ChatInput, db: Session = Depends(get_db)):
    pergunta = chat_in.pergunta
    resposta = responder_pergunta_cientifica(pergunta, db)
    
    # Adicionar na trilha de auditoria
    db.add(TrilhaAuditoria(
        modulo="Tradutor",
        acao="Pergunta Respondida",
        descricao=f"Conversa: '{pergunta[:40]}...' respondida pelo Tradutor.",
        operador="Visitante da Feira"
    ))
    db.commit()
    
    # Tentar extrair análise explicável do último lote citado para renderizar o grid no frontend
    match_lote = re.search(r"SA-\d{3}", pergunta.upper())
    expl_data = None
    
    if match_lote:
        lote_id = match_lote.group(0)
        ultima_leitura = db.query(LeituraSensor).filter(LeituraSensor.lote_id == lote_id).order_by(LeituraSensor.timestamp.desc()).first()
        if ultima_leitura:
            expl_data = analisar_risco_ia(
                ox=ultima_leitura.oxigenacao_limpa,
                temp=ultima_leitura.temperatura_c,
                vazao=ultima_leitura.vazao_l_min,
                ph=ultima_leitura.ph,
                viscosidade=ultima_leitura.viscosidade_cp,
                hematocrito=ultima_leitura.hematocrito_pct
            )
            expl_data["valores_sensores"] = {
                "oxigenacao": ultima_leitura.oxigenacao_limpa,
                "temperatura": ultima_leitura.temperatura_c,
                "vazao": ultima_leitura.vazao_l_min,
                "ph": ultima_leitura.ph,
                "viscosidade": ultima_leitura.viscosidade_cp,
                "hematocrito": ultima_leitura.hematocrito_pct
            }
    
    return {
        "resposta": resposta,
        "explicabilidade": expl_data
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
