import datetime
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = (
    "sqlite:////tmp/flowtificial.db"
    if os.getenv("VERCEL")
    else "sqlite:///./flowtificial.db"
)

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
