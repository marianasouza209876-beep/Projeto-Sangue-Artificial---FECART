import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:///./flowtificial.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Lote(Base):
    __tablename__ = "lotes"

    id = Column(String, primary_key=True, index=True) # Ex: SA-023
    nome = Column(String, nullable=True) # Nome do lote
    data_criacao = Column(DateTime, default=datetime.datetime.now)
    finalidade = Column(String, nullable=True) # Finalidade clínica do lote
    status_inicial = Column(String, default="ESTÁVEL")
    composicao = Column(String, default="PFC (Perfluorocarbono) Premium")
    
    leituras = relationship("LeituraSensor", back_populates="lote")

class LeituraSensor(Base):
    __tablename__ = "leituras_sensores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lote_id = Column(String, ForeignKey("lotes.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Dados brutos recebidos
    oxigenacao_bruta = Column(String)
    temperatura_bruta = Column(String)
    vazao_bruta = Column(String)
    
    # Dados limpos e normalizados (Camada 2)
    oxigenacao_limpa = Column(Float)   # 0.0 a 1.0 (ex: 0.95 para 95%)
    temperatura_c = Column(Float)      # Celsius
    vazao_l_min = Column(Float)        # Litros/minuto
    ph = Column(Float)                 # Simulado com base em ox/temp se não houver
    viscosidade_cp = Column(Float)     # Centipoise, simulada
    hematocrito_pct = Column(Float)    # Porcentagem equivalente, simulada
    
    # Diagnóstico da Camada 3
    status = Column(String)            # ESTÁVEL, ALERTA, CRÍTICO
    alerta_mensagem = Column(String)

    lote = relationship("Lote", back_populates="leituras")

class TrilhaAuditoria(Base):
    __tablename__ = "trilha_auditoria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    modulo = Column(String) # Dados, Processamento, IA, Tradutor
    acao = Column(String)
    descricao = Column(String)
    operador = Column(String, default="Sistema Automático")

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Preencher dados iniciais se vazio
    db = SessionLocal()
    try:
        if db.query(Lote).count() == 0:
            # Criar Lotes Padrão
            lote1 = Lote(id="SA-023", nome="Lote Alfa Trauma", finalidade="Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)", status_inicial="ESTÁVEL", composicao="Emulsão de Perfluorocarboneto 20% com Albumina")
            lote2 = Lote(id="SA-024", nome="Lote Beta Transplante", finalidade="Preservação Avançada de Órgãos para Transplante", status_inicial="CRÍTICO", composicao="Hemoglobina Polimerizada de Base Humana (HBOC)")
            lote3 = Lote(id="SA-025", nome="Lote Gama Altitude", finalidade="Resgate e Cirurgia em Altas Altitudes", status_inicial="ESTÁVEL", composicao="Cápsulas Lipossomais de Hemoglobina (LEH)")
            
            db.add_all([lote1, lote2, lote3])
            db.commit()
            
            # Adicionar trilha
            log = TrilhaAuditoria(
                modulo="Dados",
                acao="Inicialização do Banco",
                descricao="Criação automática dos lotes experimentais SA-023, SA-024 e SA-025.",
                operador="Inicializador de Sistema"
            )
            db.add(log)
            
            # Adicionar leituras iniciais para simular histórico
            # Lote SA-023: Estável e seguro
            leitura1 = LeituraSensor(
                lote_id="SA-023",
                oxigenacao_bruta="95%",
                temperatura_bruta="36.5C",
                vazao_bruta="4.8L/min",
                oxigenacao_limpa=0.95,
                temperatura_c=36.5,
                vazao_l_min=4.8,
                ph=7.41,
                viscosidade_cp=3.8,
                hematocrito_pct=42.0,
                status="ESTÁVEL",
                alerta_mensagem="Operação ótima em temperatura e oxigenação ideais."
            )
            # Lote SA-024: Crítico por temperatura alta e oxigênio baixo
            leitura2 = LeituraSensor(
                lote_id="SA-024",
                oxigenacao_bruta="82 pct",
                temperatura_bruta="39.2",
                vazao_bruta="2.5",
                oxigenacao_limpa=0.82,
                temperatura_c=39.2,
                vazao_l_min=2.5,
                ph=7.15, # Acidose simulada
                viscosidade_cp=6.2, # Hiperviscosidade por estresse térmico
                hematocrito_pct=30.0,
                status="CRÍTICO",
                alerta_mensagem="Degradação térmica ativa. Temperatura de 39.2°C excede limite crítico de 38°C. Oxigenação crítica abaixo de 90%."
            )
            
            db.add_all([leitura1, leitura2])
            db.commit()
    finally:
        db.close()
