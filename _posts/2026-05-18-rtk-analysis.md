---
layout: post
image: assets/images/system-design/capa-confiabilidade.png
author: matheus
featured: false
published: true
categories: [ ia ]
title: Field Notes - Análise do RTK no meu principal workflow agentico 
---

# Fluxo Agêntico

* Fluxo de IA mais importante 
* Cenários mais extenso e complexos dos meus workflows 
* Intecionalmente detalhista 
* 4 agents
  * go-performance-engineer 
  * go-reliability-engineer
  * go-observability-engineer
  * po-technical-spec
* Fluxo que normalmente não economizo tokens, analise aprofundada 
* Teste no pior cenário 
* Fluxo de análise de código, maior numero de operacões que o rtk cobre 

> analise a codebase deste projeto em paralelo com os agentes de performance,    reliability e observability. Gere seus relatórios dentro da pasta analysis/raw com    suas considerações. Após finalizar, inicie o agente de po-spec para analisar os    relatórios e criar um backlog consolidado e priorizado incluindo os prompts de    implementação de cada uma das tarefas 


# Execução dos Testes

## Execução do Workflow sem RTK

![Sem RTK](/assets/images/rtk/sem-rtk-usage.png)

* Total cost:            $6.39
* Total duration (API):  40m 7s
* Total duration (wall): 38m 30s

### RTK Sessão 

![Sem RTK](/assets/images/rtk/sem-rtk-sessao-5h.png)

### Agents Usage

![Sem RTK](/assets/images/rtk/sem-rtk-session.png)

Subagents               % of usage
po-technical-spec              38%
go-performance-engineer        24%
observability-expert           16%
reliability-engineer           15%

  Usage by model:
      claude-haiku-4-5:  524 input, 18 output, 0 cache read, 0 cache write ($0.0006)
     claude-sonnet-4-6:  1.4k input, 116.5k output, 1.6m cache read, 458.8k cache write ($3.94)
       claude-opus-4-7:  33 input, 44.3k output, 897.9k cache read, 143.5k cache write ($2.45)

### Agents Output

  ┌─────────────────────────┬─────────────────────┬────────────────────────┐
  │         Arquivo         │       Tamanho       │        Conteúdo        │
  ├─────────────────────────┼─────────────────────┼────────────────────────┤
  │ performance-report.md   │ 39 KB               │ 33 issues — 8 críticos │
  ├─────────────────────────┼─────────────────────┼────────────────────────┤
  │ reliability-report.md   │ 41 KB               │ 30 issues — 9 críticos │
  ├─────────────────────────┼─────────────────────┼────────────────────────┤
  │ observability-report.md │ 33 KB               │ gaps nos 3 pilares     │
  ├─────────────────────────┼─────────────────────┼────────────────────────┤
  │ backlog.md              │ 85 KB / 1739 linhas │ 36 tasks priorizadas   


## Execução do Workflow com RTK

### RTK Sessão 

### Agents Usage

### Agents Output


# Comparação dos Modelos 

## Numero de Issues 

| Agente  | RTK         | Performance   | Reliability   | Observability | Criticidade   | 
| --------|-------------| ------------- | ------------- | ------------- | ------------- |


## Tokens Usados 

| Agente | RTK | Tokens | Tempo de Execução | 

### Qualidade dos Apontamentos




# Common Tasks Benchmark 

