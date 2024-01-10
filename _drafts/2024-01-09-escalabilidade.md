---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Escalabilidade
---

# Definindo escalabilidade

Escalabilidade é a capacidade de um sistema, aplicação ou negócio de crescer e lidar com um aumento na carga de trabalho, sem comprometer a qualidade, desempenho e eficiência. Isso pode incluir o aumento de usuários, transações, dados ou recursos. É um atributo crítico para sistemas que esperam um aumento no volume de usuários ou dados.

A escalabilidade é um conceito importante no design de sistemas, pois é crucial para garantir que as aplicações e produtos possam lidar com um aumento na carga de trabalho sem sacrificar a qualidade ou o desempenho. Isso é especialmente importante em ambientes de nuvem, onde as demandas podem mudar rapidamente e os sistemas devem ser capazes de se adaptar a essas mudanças

# Importância da Escalabilidade em Sistemas Modernos

# Escalabilidade Vertical e Escalabilidade Horizontal

Existem dois tipos principais de escalabilidade que são frequentemente discutidos no design de sistemas: escalabilidade horizontal e escalabilidade vertical.

## Escalabilidade Vertical

![Escalabilidade Vertical](/assets/images/system-design/onibus-vertical.png)

CPU, RAM. Embora seja uma solução mais simples, frequentemente encontra limites físicos e de custo.

![Escalabilidade Vertical](/assets/images/system-design/scale-up.png)

### Scale UP e Scale Down

Scale-UP e Scale-Down são atividades que ocorrem nas operações de escalabilidade vertical, que se dedicam a aumentar ou reduzir recursos computacionais de determinado servidor que desempenha alguma funcionalidade. Scale-Up se refere ao ato de aumentar recursos, sendo esses CPU, memória, disco, rede. E Scale-Down é a operação de diminuir esses recursos quando necessário. 

## Escalabilidade Horizontal

![Escalabilidade Horizontal](/assets/images/system-design/onibus-horizontal.png)

Escalabilidade Horizontal: Adicionar mais máquinas ou instâncias no sistema para lidar com a carga. É frequentemente associada à flexibilidade e à capacidade de crescimento contínuo.

A escalabilidade horizontal refere-se à adição de mais nós como servidores, containers, replicas a um componente ou um sistema. Isso é também conhecido como "scale out". Por exemplo, se você está executando uma aplicação web em um único nó, mas começa a receber muito tráfego, você pode adicionar mais replicas ao sistema para compartilhar a carga de trabalho. Este método é chamado de escalabilidade horizontal 

![Escalabilidade Horizontal](/assets/images/system-design/scale-out.png)

### Scale Out e Scale In

Scale-In e Scale-Out são as atividades demandadas pela escalabilidade **horizontal**. Scale-Out (Escale para Fora) se refere a incrementar o número de servidores ou replicas que atendem exercem a mesma função, para dividir a carga de processamento entre eles. Scale-In é a operação inversa, onde reduzimos o número de servidores ou replicas do pool de maquinas.


## Capacity Planning e Autoscaling


### Calculo Base Para Capacity

Para entender a forma como os processos de escalonamento funcionam, iremos utilizar a função base a seguir, onde o objetivo é encontrar a quantidade ideal de replicas para atender os requisitos de sistema observado. 

\begin{equation} \text{Réplicas Desejadas} = \text{Réplicas Atuais} \times \left( \frac{\text{Valor Atual da Variável}}{\text{Valor de Base da Variável}} \right) \end{equation} 

Inicialmente, pode parecer um pouco abstrato, mas a seguir iremos abordar alguns exemplos onde vamos colocar essa formula em prática para diferentes cenários. Antes disso vamos considerar as `Replicas Desejadas` como a quantidade de replicas ideal para o momento da aplicação, `Valor Base da Variável` como o threshold máximo da métrica que estamos observando e o `Valor atual da Variável` como o valor atual da mesma métrica. Vamos entender.

### Utilização de Recursos 

A forma mais simples de entender esse calculo de capacity é utilizando recursos computacionais como CPU e memória, que são métricas mais comumente utilizadas para configurar processos de escala automática de aplicações, pois fazem parte do processo mais "natural" de planejar capacity e escalabilidade automática por serem métricas fáceis de serem calculadas, planejadas e monitoradas. 

O objetivo desse tipo de abordagem é determinar o quanto de cada recurso (CPU, memória, disco, rede) está sendo usado. A utilização excessiva pode indicar um gargalo, e a formula nos ajudará a recapacitar o sistema para contornar esse gargá-lo. 

A formula base aplicada ao cenário seria: 

\begin{equation} \text{Réplicas Desejadas} = \text{Réplicas Atuais} \times \left( \frac{\text{Utilização de CPU}}{\text{Utilização Base de CPU}} \right) \end{equation} 

Antes de aplicarmos formula precisamos calcular a `Utilização de CPU`, pra isso vamos precisar de uma formula intermediária, onde precisamos dividir a **quantidade de recurso utilizado** pela **quantidade de recurso autorizado para o uso** perante a todo recurso computacional disponível. Vamos presumir que 1 core de CPU é composto por 1000m (milicores) para calcular a utilização. Esse exemplo é proximo das unidades utilizadas para capacity de workloads em clusters de Kubernetes. 

\begin{equation} \text{Utilização de Recurso} = \left( \frac{\text{Recurso Solicitado}}{\text{Recurso Disponível}} \right) \times 100\ \end{equation} 


Nesse cenário vamos presumir que: 
* **Replicas Atuais**: 6 replicas
* **Recurso de Cada Replica**: Cada replica pode utilizar 200m (200 milicores do sistema)
* **Recurso Solicitado**: 1200m (1200 milicores do sistema, ou 1 core e 200 milicores)
* **Recurso Disponível**: 600m (600 milicores do sistema)
* **Utilização base de CPU**: 80% 

\begin{equation} \text{Utilização de CPU} = \left( \frac{\text{1200m}}{\text{600m}} \right) \times 100\ \end{equation} 

\begin{equation} \text{Utilização de CPU} =  \{\text{200%}}\ \end{equation} 

Agora chemados ao valor base de `Utilização de CPU` em `200%`, podemos aplicá-lo a formula base usando como utilização base de escala os 80% do uso da CPU e contabilizando as `Replicas atuais` como `6`. 

\begin{equation} \text{Réplicas Desejadas} = \text{6} \times \left( \frac{\text{200}}{\text{80}} \right) \end{equation}

\begin{equation} \text{Réplicas Desejadas} = \text{15} \end{equation}

Podemos entender que nesse cenário de avaliação de capacity, caso uma ação de recapacity em escalabilidade horizontal fosse realizada, o ideal para se contornar o gargalo devido a utilização de recursos seria recapacitar o número de replicas para 15 unidades. 


### Throughput

Mede quantas unidades de trabalho (como transações ou requisições) o sistema pode processar por unidade de tempo. É uma métrica fundamental para entender a capacidade do sistema.


\begin{equation} \ \text{Throughput} = \frac{\text{Total de Unidades de Trabalho Processadas}}{\text{Tempo Total}} \ \end{equation} 

### Transações Por Segundo/Minuto

\begin{equation} \ \text{TPS} = \frac{\text{Total de Requisições Atendidas}}{\text{Unidade de Tempo}} \ \end{equation} 

### Latência

Refere-se ao tempo necessário para completar uma tarefa ou transação específica. Em sistemas escaláveis, é importante que a latência não aumente significativamente à medida que o sistema escala.

\begin{equation}  \text{Latência} = \text{Tempo de Resposta Final} - \text{Tempo de Requisição Inicial} \end{equation} 

### Taxa de Erros 

A porcentagem de todas as requisições que resultam em um erro. Um sistema escalável deve manter ou reduzir sua taxa de erro à medida que a carga aumenta.

\begin{equation} \text{Taxa de Erro} = \left( \frac{\text{Número de Requisições com Erro}}{\text{Total de Requisições}} \right) \times 100\% \end{equation} 


### Quantidade de Replicas Desejada baseada no Uso de Recursos

\begin{equation} \text{Réplicas Desejadas} = \text{Réplicas Atuais} \times \left( \frac{\text{Utilização Atual da CPU}}{\text{Utilização Alvo da CPU}} \right) \end{equation} 


\begin{equation} \text{Réplicas Desejadas} = 4 \times \left( \frac{300\}{80\} \right)\ \end{equation} 


\begin{equation} \text{Réplicas Desejadas} = 4 \end{equation} 


### Custo de Transação 

Uma análise de custo-benefício que determina o custo operacional por unidade de trabalho processada.

\begin{equation} \text{Custo por Transação} = \frac{\text{Custo Total Operacional}}{\text{Total de Transações}} \end{equation} 

# Escalabilidade de Software

# Outros principios de escalabilidade


#### Referências

[Test of the New Infortrend CS Scale-Out NAS Cluster (Part 1)](https://www.digistor.com.au/the-latest/cat/digistor-blog/post/test-new-infortrend-cs-scale-out-nas-cluster/)

[Horizontal Pod Autoscaling - Algorithm details](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)

{% include latex.html %}