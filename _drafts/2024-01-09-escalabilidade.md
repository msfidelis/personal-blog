---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Escalabilidade, Performance e Capacidade
---

# Definindo Performance 

Performance, em seus termos mais simplistas, se refere ao **quão rápido e eficiênte um sistema ou algoritmo consegue ser ao processar uma única transação**, isso pode ser medido de **forma isolada** ou em meio a um **grande volume de outras transações**. A parte prática da "performance" pode envolver vários termos técnicos e complexos dentro de todas as disciplinas que compõe a engenharia de software no geral, mas principalmente é sentida pelos usuários finais das nossas soluções. 

A performance deve ser considerada em relação aos requisitos funcionais e não funcionais do sistema. Por exemplo, um sistema projetado para processamento de dados em tempo real terá diferentes expectativas de performance comparado a um sistema de armazenamento de dados de longo prazo. 

<br>

## Métricas de Performance

É crucial entender como o desempenho do sistema varia sob diferentes condições, como picos de carga, falhas de componentes, ou mudanças no padrão de uso.

A avaliação de performance de um sistema ou algoritmo requer mecanismos de monitoramento de indicadores chave, também conhecidos como KPI's, Service Levels entre outros. Observar essas métricas de forma sequencial e contínua por vários períodos de tempo podem trazer ideias valiosas sobre como o sistema está operando e dar autonomia para os times de engenharia tomarem decisões sobre design, manutenção e operação do sistema, além de fornecer dados para identificação de tendências, fazer comparação de benchmarks, projetar e prever capacidade e identificar e priorizar quais partes precisam de melhoria de forma mais urgente. 

Existem várias métricas importantes na hora de avaliar um sistema, algumas são padrões quase universais que podem ser aplicadas em quase todos os cenários, como existem outras que são provenientes de negócios e necessidades mais específicos que só são aplicadas e fazem sentido em contextos muito específicos. Saber idenficar oportunidades de métricas a serem monitoradas representa uma trabalho árduo e contínuo que depende muito de maturidade de "horas de vôo" de um software. 

Para esse texto vamos trabalhar com o "feijão com arroz" das métricas de performance, também conhecidas no mercado como `Four Golden Signals`. 

<br>

### Utilização e Saturação de Recursos

Algoritmos que fazem uso intensivo de recursos computacionais como CPU, Memória, Disco e Rede costumam ser muito sensíveis a otimização e degradação desses recursos. Ter visibilidade da utilização de todas as capacidades disponíveis para um sistema é essencial para determinar a saúde do serviço e fornecer insights de otimização, custos e performance. 

Podemos representar matematicamente a utilização de um recurso computacional disponível a partir de uma formula simples: 

\begin{equation} \text{Utilização de Recurso} = \left( \frac{\text{Recurso Utilizado}}{\text{Recurso Disponível}} \right) \times 100\ \end{equation} 

Vamos imaginar um caso onde precisamos analisar o uso de memória alocado para um sistema. Basicamente vamos presumir um cenário onde temos disponível para rodar um algoritmo `2 GB` de RAM, ou `2048 MB`. Após processos de coleta de métricas e observação, foi constatado que o uso atual dessa memória disponível se encontra em `1 GB`, ou `1024 MB`. 

\begin{equation} \text{Utilização de Memória} = \left( \frac{\text{1024}}{\text{2048}} \right) \times 100\ \end{equation} 

\begin{equation} \ \text{Utilização de Memória} = \text{50%} \end{equation} 

Segundo calculo no cenário hopotético, a utilização de memória do sistema se encontra em 50% do uso da capacidade disponível. Analisar a utilização de recursos é crucial para otimização de performance, nos fornecendo insumos necessários para criar sistemas mais baratos, performáticos e eficiêntes. 

<br>

### Throughput, ou Tráfego

O *Throughput* de maneira geral descreve o número de operações que um sistema consegue realizar dentro de um determinado período de tempo. Mede quantas unidades de trabalho (como transações ou requisições) um determinado sistema ou algoritmo pode processar por unidade de tempo, como requisições por segundo, vendas por minuto, arquivos por dia ou eventos por mês. É uma métrica fundamental para entender a capacidade e performance de aplicações. Em sistema projetados para lidar com protocolos web, o Throughput  é contabilizado a partir de quantas requisições HTTP a aplicação recebeu e respondeu. 

A formula utilizada para calcular o throughput pode ser representada matematicamente da seguinte forma:

\begin{equation} \ \text{Throughput} = \frac{\text{Total de Unidades de Trabalho Processadas}}{\text{Tempo Total}} \ \end{equation} 

Desenhando um cenário hipotético onde um sistema recebeu `6.000` requisiçõe no ultimo minuto, podemos podemos calcular o throughput `por segundo` da seguinte forma:


\begin{equation} \ \text{Throughput} = \frac{\text{6000}}{\text{60}} \ \end{equation} 

\begin{equation} \ \text{Throughput} = \text{100.00 rps} \end{equation} 

Representar matematicamente o Throughput do sistema é muito valioso em termos de performance, nos ajuda a entender até quanto em termos de uso nosso sistema consegue atender até começar a mudar suas métricas de aceitação de tempo de resposta e taxa de erros. Podemos utilizar o Throughput dentro de periodos lógicos de tempo para efetuar operações escalabilidade dinâmica, como veremos na sessão de **escalabilidade**.


<br>

### Tempo de Resposta

Tempo de Resposta refere-se ao tempo total necessário para completar uma tarefa ou transação específica. Em sistemas escaláveis, é importante que a latência não aumente significativamente à medida que a utilização da aplicação se eleva. O tempo de resposta é composto da soma da latência e do tempo de processamento, e é medido através de um client e um server. 

A `Latência` pode ser definida como o **atraso de rede ou o tempo que uma solicitação para viajar do remetente ao receptor**. Em outras palavras, é o atraso entre o início de uma ação e o início da reação, pode ser influenciado pela distância física entre os comunicantes, a velocidade do meio de transmissão, e qualquer atraso introduzido por dispositivos intermediários (como roteadores).

O `Tempo de Processamento` é o tempo que um sistema leva para **processar uma solicitação após recebê-la**. Esse termo é frequentemente usado para descrever o tempo necessário para uma CPU ou servidor processar uma tarefa específica.

O `Tempo de Resposta` é o **tempo total que leva desde o envio de uma solicitação até o recebimento da resposta**. Ele inclui tanto a latência (tempo de ida e volta da rede) quanto o tempo de processamento no servidor, sendo uma soma de ambas na maioria dos casos. Em um contexto de usuário final, é o tempo que leva desde que um usuário faz uma ação (como clicar em um link ou pressionar uma tecla) até que ele vê o resultado dessa ação.

No mais, o calculo do tempo de resposta pode ser representado dessa forma a partir do cliente, contabilizando o tempo final subtraindo o tempo inicial da requisição observada:

\begin{equation}  \text{Tempo de Resposta} = \text{Timestamp da Resposta} - \text{Timestamp da Requisição} \end{equation} 

Todas as três variáveis apresentadas podem ser observadas e medidas independentemente de acordo com as necessidades do ambiente, inclusive sendo uma boa prática para executar throubleshootings mais granulares em investigações de problemas, como identificar em que exato ponto da transação ocorreu a degradação em questão. 

<br>

### Taxa de Erros 

Uma das principais métricas que podem ser utilizadas para avaliar performence, capacidade e disponibilidade de sistemas é a taxa de erros. Essa métrica pode ser utilizada junto a métricas de tempo de resposta e Throughput para tirar  conclusões valiosas a respeito do comportanto de um sistema. 

A taxa de erros corresponde porcentagem de todas as requisições que resultam em um erro perante a soma das requisições totais. Entedemos que um sistema escalável com capacidade planejada, **deve manter ou reduzir sua taxa de erro à medida que a carga aumenta**.

Para calcular a taxa de erros de um sistema, geralmente usamos uma fórmula simples que relaciona o número de eventos de erro com o número total de eventos ou tentativas. A taxa de erros é frequentemente expressa como uma porcentagem. Aqui está a fórmula básica:

\begin{equation} \text{Taxa de Erro} = \left( \frac{\text{Número de Erros}}{\text{Número Total de Tentativas ou Eventos}} \right) \times 100\ \end{equation} 

Suponha que você tenha um sistema que processou 1.000 transações, das quais 50 resultaram em erros. A taxa de erros seria calculada como:

\begin{equation} \text{Taxa de Erro} = \left( \frac{\text{50}}{\text{1000}} \right) \times 100\ \end{equation} 

\begin{equation} \ \text{Taxa de Erro} = \text{5.0}\% \end{equation} 

Essa métrica é particularmente útil para avaliar a confiabilidade e a qualidade de sistemas de software, especialmente em ambientes de produção onde a estabilidade é crítica. Acompanhar a taxa de erros ao longo do tempo pode ajudar a identificar tendências, avaliar o impacto de mudanças ou atualizações no sistema e determinar áreas que podem precisar de melhorias.



<br>

# Definindo Capacidade 

Capacidade, ou "capacity", no contexto da engenharia de software, refere-se à **quantidade máxima de trabalho que o sistema pode receber e processar de maneira eficaz em um determinado período de tempo**, é uma forma de medir e **encontrar limite atual do sistema**, incluindo recursos como CPU, memória, armazenamento e largura de banda de rede e performance de algoritmos. 

Este conceito é fundamental na arquitetura e design de sistemas, bem como no planejamento de infraestrutura geral dos componentes de software. A capacidade abrange vários aspectos do sistema, que vão desde a habilidade do sistema de **processar dados ou transações**, vinculado diretamente ao **poder de processamento computacional**, **velocidade desse processamento** e eficácia e eficiência, **suportar uma quantidade de usuários ou processos simultaneamente**, **sem degradação do desempenho e se adaptar a cargas de trabalho crescentes**, aumentando recursos conforme necessário para manter a experiência constante em meio a variações desses cenários. 

Pensar e medir a capacidade de sistemas envolve não apenas o dimensionamento adequado dos recursos computacionais do sistema, mas também a implementação de estratégias para monitoramento, observabilidade, gerenciamento de desempenho, automações e escalabilidade.


## Gargalos de Capacidade 

Dentro do contexto de capacidade de software, "gargalos" referem-se a **pontos no sistema onde o desempenho ou a capacidade são limitados devido a um componente específico que não consegue lidar eficientemente com a carga atual**. Estes gargalos podem afetar negativamente a capacidade geral do sistema de funcionar de maneira otimizada e podem ocorrer em várias áreas, incluindo hardware, software ou na arquitetura de rede. Isso pode incluir CPU insuficiente, memória, espaço em disco, ou capacidade de rede. Por exemplo, um servidor com CPU sobrecarregada não conseguirá processar requisições rapidamente. Erroneamente profissionais de diversos níveis de senioridade podem associar gargalos sistemicos a infraestrutura da aplicação, porém é muito mais comum cenários onde código mal otimizado ou algoritmos ineficientes, gerenciamento de concorrência, como deadlocks ou uso excessivo de bloqueios, podem limitar a capacidade do sistema e se tornar gargalos muitos dificeis de lidar e se superar no dia a dia de times de engenharia. 

Um design de sistema que não distribui carga de maneira eficiente pode criar gargalos invariávelmente. Por exemplo, um ponto central de processamento de alguma rotina em uma arquitetura que deveria ter a capacidade de quebrar essa carga em várias partes e poder se tornar distribuída.

dentificar e resolver gargalos é crucial para otimizar a performance e a escalabilidade de sistemas de software. Isso geralmente envolve monitoramento detalhado, testes de desempenho e ajuste fino do sistema. Em ambientes de nuvem e sistemas distribuídos, a identificação de gargalos também pode incluir a análise da distribuição de carga e da escalabilidade dinâmica.

## Backpressure de Capacidade

O conceito de `"backpressure"`, ou `"repressão"` em software e, especialmente, em arquiteturas baseadas em microserviços, também pode ter várias definições dependendo de onde foi empregado. Em alguns locais, o backpressure pode ser a capacidade ou um mecanismo intensional de um sistema de gerenciar seu Input/Output evitando gargalos de processamento. Aqui, vamos emprestar o da engenharia física, de gestão de flúidos, onde o mesmo se refere à resistência oposta ao movimento de um fluido. 

De acordo com o Wikipédia

> Backpressure, Repressão ou Pressão Traseira é o termo para definir **uma resistência ao fluxo desejado de fluido através de tubos**. Obstruções ou curvas apertadas criam **contrapressão através de perda de atrito e queda de pressão**.

![Backpressure - Pipes](/assets/images/system-design/Back_pressure.jpg)

No contexto de software, **backpressure ocorre quando um componente ou serviço em um sistema distribuído começa a receber mais dados ou solicitações do que é capaz de processar**. Isso pode levar a uma série de problemas, como o aumento do tempo de resposta, falhas e perda de dados.

Vamos ilustrar uma solicitação em um sistema fictício que é atendida pelo pelos Serviços `A`, `B` e `C` sequencialmente. Respectivamente esses serviços que compõe a transação suportam `100`, `60` e `300`  transações por segundo. Em uma volumetria de 90 transações por segundo, todos os componentes desse sistema conseguem receber e dar vazão de forma eficiente para toda a carga de trabalho inserida sem maiores problemas. 

Nesse mesmo cenário, caso esse sistema receba 100 transações por segundo, o que é suportado a níveis de capacidade por 2 dos 3 serviços do conjunto, o serviço B terá um backpressure de 40 transações a cada segundo, pois o mesmo só suporta dar vasão para 60 delas. 

![Backpressure - warning](/assets/images/system-design/Scale-Backpressure.drawio.png)

Em um cenário mais crítico, entendendo que o `serviço C` consegue suportar até 300 transações, se injetarmos 120 transações por segundo nesse conjunto, a diferença do input do serviço A para o B será de 20 transações, pois o mesmo só suporta 100 delas nesse tempo, e em seguida, 100 dessas transações que foram repassadas para o serviço B que só suporta 60 serão represadas por capacidade computacional, fazendo com que o backpressure total dessa solicitação seja de 60 TPS, 50% de degradação entre o input inicial e output final, independentemente da capacidade do sistema mais performático de todo o fluxo, que em 100% do tempo terá sua real capacidade sempre ociosa devido aos delimitadores de capacidade dos serviços anteriores. 

![Backpressure - danger](/assets/images/system-design/Scale-Backpressure%20-%20Danger.drawio.png)

**Henry Ford** popularizou a frase que dizia que *“uma corrente é tão forte quanto seu elo mais fraco”*. O Backpressure nos ajuda a evidenciar que por mais que existam serviços mais performáticos que outros compondo um todo de um sistema, nosso throughput e capacidade serão limitados ao componente mais degradado. 

## Custo de Transação por Capacidade

Analisar o custo por transação é muito interessante para avaliar a eficiência e custo-beneficio da capacidade alocada para o sistema. O cálculo do custo de transação em sistemas é uma métrica financeira que avalia o custo total associado à execução de uma operação ou transação. Essa métrica é muito interessante quando construímos sistemas em núvens públicas onde o financeiro é muito sensível. Podemos calcular o custo de transação através de insumos vindo da contabilização total de transações do cliente. Normalmente essa métrica é coletada somente de requisições que vem do cliente final, não sendo multiplicada pelo numero de subsistemas e microserviços transparantes aos estimulos do mesmo.  

Ele ajuda as organizações a entenderem melhor onde e como seus recursos estão sendo gastos e onde podem ser feitas economias ou melhorias, e pode ser representado pelo custo total da operação em questão dividido pelo total de transações dentro do mesmo período de tempo. 

\begin{equation} \text{Custo por Transação} = \frac{\text{Custo Total Operacional}}{\text{Total de Transações}} \end{equation} 

Em sistemas com padrões de demanda variáveis, o custo por transação pode mudar com o tempo. É importante considerar picos de demanda e como eles afetam o custo médio. Um custo por transação mais baixo geralmente indica maior eficiência e uso eficaz dos recursos.

<br>

# Definindo Escalabilidade

Escalabilidade é a **capacidade de um sistema, aplicação ou negócio de crescer e lidar com um aumento na carga de trabalho, sem comprometer a qualidade, desempenho e eficiência**. Isso pode incluir o aumento de usuários, transações, dados ou recursos. É um atributo crítico para sistemas que esperam um aumento no volume de usuários ou dados. É uma característica de design que indica quão bem um sistema pode se adaptar a cargas de trabalho maiores ou menores.

De acordo com o livro *"Relese It!" de Michael T. Nygard*, a escalabilidade pode ser definida de duas formas: A primeira para descrever como o Throughput muda de acordo com variações de demanda, como um grafico de *requests por segundo* comparado com *tempo de resposta*  de um sistema, e em segundo momento se refere aos modos de escala que um sistema possui. Aqui, assim como no livro, vamos definir escalabilidade como a **capacidade de adicionar ou remover capacidade computacional a um sistema**. 

A escalabilidade é um conceito importante no design de sistemas, pois é crucial para garantir que as aplicações e produtos possam lidar com um aumento na carga de trabalho sem sacrificar a qualidade ou o desempenho. Isso é especialmente importante em ambientes de nuvem, onde as demandas podem mudar rapidamente e os sistemas devem ser capazes de se adaptar a essas mudanças.

## Importância da Escalabilidade em Sistemas Modernos

A escalabilidade permite que os sistemas se adaptem rapidamente a mudanças no volume de tráfego ou demanda de recursos, garantindo um desempenho consistente mesmo sob carga variável. Em ambientes de negócios dinâmicos, a capacidade de escalar recursos conforme necessário é crucial para manter a continuidade e a eficiência operacional, além de ser capazes de manter tempos de resposta rápidos e desempenho confiável mesmo sob cargas leves, médias e pesadas, resultando em uma experiência de usuário mais satisfatória.

Sistemas escaláveis podem ser mais econômicos, pois permitem um dimensionamento eficiente de recursos. Isso significa pagar apenas pelos recursos que são usados, reduzindo o desperdício e otimizando os custos operacionais, além de facilitar a implementação de novas funcionalidades e a expansão de negócio, sem a necessidade de reestruturar completamente a infraestrutura projetada já existente.

## Escalabilidade Vertical e Escalabilidade Horizontal

Existem dois tipos principais de escalabilidade que são frequentemente discutidos no design de sistemas: `Escalabilidade Horizontal` e `Escalabilidade Vertical`. Vamos usar esse tópico para 

### Escalabilidade Vertical

![Escalabilidade Vertical](/assets/images/system-design/onibus-vertical.png)

No design de sistemas que se baseiam em escalabilidade vertical, o foco está na **maximização do processamento e eficiência de um único servidor ou recurso**. Isso pode incluir a otimização de algoritmos e a escolha de tecnologias que maximizam o uso da CPU e da memória.

No mais, a escalabilidade vertical pode ser majoritariamente resumida em aumetar capacidade de CPU, RAM, Disco ou Rede de um único recurso. Embora seja uma solução mais simples, frequentemente encontra limites físicos e de custo.

![Escalabilidade Vertical](/assets/images/system-design/scale-up.png)

#### Scale Up e Scale Down

As operações de `Scale-up` e `Scale-down` são atividades que ocorrem nas operações de escalabilidade vertical, que se dedicam a aumentar ou reduzir recursos computacionais de determinado servidor que desempenha alguma funcionalidade. A otividade de `Scale-Up` *(escale para cima)* **se refere ao ato de aumentar recursos**, sendo esses CPU, memória, disco, rede. E `Scale-down` *(escale para baixo)* **é a operação de diminuir esses recursos quando necessário**. Resumidamente, Scale-up *(para cima)* se consiste em adicionar recursos de hardware cada vez maiores, aumentando o número de disco, CPU's e memória ram do servidor e Scale-down *(para baixo)* seria diretamente associado a diminuir esses recursos quando necessário. 

### Escalabilidade Horizontal

![Escalabilidade Horizontal](/assets/images/system-design/onibus-horizontal.png)

A escalabilidade horizontal **refere-se à adição de mais nós como servidores, containers, replicas a um componente ou um sistema**. Isso é também conhecido como `"scale out"`. Por exemplo, se você está executando uma aplicação web em um único nó, mas começa a receber muito tráfego, você pode adicionar mais replicas ao sistema para compartilhar a carga de trabalho através de um [Balanceador de Carga](/load-balancing/). Este método é chamado de escalabilidade horizontal, e pode ser interpretado também como a capacidade de crescimento de contínuo da capacidade de um sistema se for utilizado em conjunto com ferramentas de escalabilidade automática.

Para efetivamente implementar a escalabilidade horizontal, os sistemas devem ser projetados com uma arquitetura distribuída. 

![Escalabilidade Horizontal](/assets/images/system-design/scale-out.png)

#### Scale Out e Scale In

As operações de `Scale-in` e `Scale-out` são as atividades demandadas pela escalabilidade **horizontal**. Scale-out (Escale para Fora) se refere a incrementar o número de servidores ou replicas que atendem exercem a mesma função, para dividir a carga de processamento entre eles. Scale-in é a operação inversa, onde reduzimos o número de servidores ou replicas do pool de maquinas. Resumidamente, Scale-out (para fora) aumentamos o número de servidores, e Scale-in (para dentro) diminuimos o numero deles. As duas operações podem operar em conjunto para ajustar a capacidade da carga de trabalho dinamicamente. 


# Capacity Planning e Autoscaling Horizontal

A ideia desse tópico é apresentar uma das várias métricas importantes para avaliar a capacidade e escalabilidade, além de utilizar essas métricas em formulas para se calcular ajustes de capacidade que podem ser vinculados com estratégias de escalabilidade horizontal. Iremos utilizar um calculo base que pode ser adaptado para uma quantidade muito grande de cenários para definir capacidade horizontal de aplicações. Esse será apenas um exemplo de inúmeras abordagens que podem ser encontradas no mercado que funcionam ativamente como mecanismos de escalabilidade automática de recursos. A formula base que iremos aplicar a seguir foi retirada do funcionamento dos `Horizontal Pod Autoscaler` ou `HPA` do `Kubernetes`, mas pode ser implementado de forma isolada para vários contextos de forma livre. 

Vamos apresentar vários cenários e métricas pertinentes para monitorar ativamente a escalabilidade de um sistema, aplicar a formula e verificar a quantidade necessária de recursos computacionais para um sistema se adaptar a um cenário de gargalo. 


## Calculo Base Para Capacity

Para entender a forma como os processos de escalonamento funcionam, iremos utilizar a função base a seguir, onde o objetivo é encontrar a quantidade ideal de replicas para atender os requisitos de sistema observado. 

\begin{equation} \text{Réplicas Desejadas} = \text{Réplicas Atuais} \times \left( \frac{\text{Valor Atual da Variável}}{\text{Valor de Base da Variável}} \right) \end{equation} 

Inicialmente, pode parecer um pouco abstrato, mas a seguir iremos abordar alguns exemplos onde vamos colocar essa formula em prática para diferentes cenários. Antes disso vamos considerar as `Replicas Desejadas` como a quantidade de replicas ideal para o momento da aplicação, `Valor Base da Variável` como o threshold máximo da métrica que estamos observando e o `Valor atual da Variável` como o valor atual da mesma métrica. Vamos entender.

<br>

## Utilização de Recursos Computacionais

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

Podemos entender que nesse cenário de avaliação, caso uma ação de recapacity em escalabilidade horizontal fosse realizada, o ideal para contornar o gargalo devido a utilização de recursos de CPU seria aumentar o número de replicas para 15 unidades. Essa lógica utilizou CPU como base, mas pode ser replicada para qualquer outro tipo de recurso. 

<br>

## Requisições e Transações por Períodos de Tempo (Throughput)

Uma das minhas formas favoritas de projetar capacity e desenhar estratégias de escalabilidade horizontal é contabilizando a quantidade de requisições que a aplicação está recebendo dentro de um período de tempo. Basicamente, essa estratégia se baseia em presumir que cada replica da aplicação consegue receber um determinado número de requisições de forma isolada sem degradar. Em resumo, se cada replica da nossa aplicação suporta 10 transações por segundo (TPS) sem degradar performance e tempo de resposta, em um momento que a aplicação estiver recebendo 100 transações por segundo o ideal seria ter 10 replicas da mesma disponíveis para atender a demanda.

\begin{equation} \text{Réplicas Desejadas} = \text{Réplicas Atuais} \times \left( \frac{\text{Requisições p/ Replica}}{\text{Base de Requisições}} \right) \end{equation}


Nesse cenário vamos presumir que: 
* **Replicas Atuais**: 6 replicas
* **Cada Replica Aguenta**: 15 transações por segundo
* **Total de Requisições Recebidas no ultimo minuto**: 10.000

Para aplicar a formula, precisamos antes definir o valor das `Requisições por Replica`. Para calcular essa variável, precisamos primeiro **calcular a quantidade de transações que estamos recebendo por segundo** dividindo o total de requisições recebidas no ultimo minuto por 60, e depois **dividir esse valor pelo número de replicas atuais**. 

\begin{equation} \ \text{Transações por Segundo} = \frac{\text{Total de Requisições Atendidas}}{\text{Período de Tempo}} \ \end{equation} 

\begin{equation} \ \text{Transações por Segundo} = \frac{\text{10000}}{\text{60}} \end{equation} 

\begin{equation} \ \text{Transações por Segundo} = \text{166.66} \end{equation} 

Segundo o exemplo, estamos recebendo em todo o sistema `166.66` requisições por segundo. Agora para chegarmos a dimensão de requisições por replica, para determinar quanto cada unidade disponível da aplicação está recebendo em média, basta dividir essa quantidade de transações pelo numero de replicas: 

\begin{equation} \ \text{Requisições por Replica} = \frac{\text{Transações por Segundo}}{\text{Replicas Atuais}} \ \end{equation} 

\begin{equation} \ \text{Requisições por Replica} = \frac{\text{166.66}}{\text{6}} \ \end{equation} 

\begin{equation} \ \text{Requisições por Replica} = \text{27.78} \end{equation} 

Agora já temos todas as variáveis necessárias para aplicarmos a formula de capacity e escalabilidade. Vamos substituir a variável `Requisições por Replica` por `27.78`, a `Base de Requisições` por `15` para representar quanto gostariamos que cada unidade da aplicação estivesse recebendo sem maiores problemas e podemos calcular a quantidade ideal de replicas: 


\begin{equation} \text{Réplicas Desejadas} = \text{6} \times \left( \frac{\text{27.78}}{\text{15}} \right) \end{equation}

\begin{equation} \text{Réplicas Desejadas} = \text{11}\ \end{equation}

Seguindo esse o exemplo, podemos presumir que em uma operação de recapacity horizontal olhando o cenário atual, o número ideal de replicas a ser definido para a aplicação seria 11 unidades. 

<br>

# Escalabilidade de Software

# Outros principios de escalabilidade


#### Referências

[Test of the New Infortrend CS Scale-Out NAS Cluster (Part 1)](https://www.digistor.com.au/the-latest/cat/digistor-blog/post/test-new-infortrend-cs-scale-out-nas-cluster/)

[Horizontal Pod Autoscaling - Algorithm details](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)

[HorizontalPodAutoscaler Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)

[Stupid Simple Scalability](https://www.suse.com/c/rancher_blog/stupid-simple-scalability/)

[Livro: Release It: Design and Deploy Production-Ready Software](https://www.amazon.com.br/Release-Design-Deploy-Production-Ready-Software/dp/0978739213)

[Kubernetes Instance Calculator](https://learnk8s.io/kubernetes-instance-calculator)

[Backpressure explained — the resisted flow of data through software](https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7)

[Back-Pressure](https://en.wikipedia.org/wiki/Back_pressure)

[Lei de Amdahl](https://pt.wikipedia.org/wiki/Lei_de_Amdahl)

[Escalabilidade](https://pt.wikipedia.org/wiki/Escalabilidade)

[Um mergulho profundo na lei de Amdahl e na lei de Gustafson](https://hackernoon.com/pt/um-mergulho-profundo-na-lei-amdahls-e-na-lei-gustafsons)

[DevOps Monitoring Guide — How to manage the 4 Golden Signals](https://www.site24x7.com/learn/4-golden-signals.html)

[The four Golden Signals of Monitoring](https://sysdig.com/blog/golden-signals-kubernetes/)

{% include latex.html %}