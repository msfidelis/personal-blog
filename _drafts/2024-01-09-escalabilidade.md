---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Escalabilidade, Performance e Capacidade
---

Esse é mais um artigo da série sobre System Design. Nele, vamos abordar três tópicos: **Capacidade**, **Performance** e **Escalabilidade** (*não necessariamente nessa ordem*), sempre com uma perspectiva conceitual de System Design. Ao escrever este capítulo, questionei-me se deveria dividí-lo em três textos separados. Contudo, fiquei tão satisfeito com o resultado que não consegui tomar essa decisão. À medida que criava tópicos, estudava e coletava referências, uma estranha sensação de querer que este capítulo nunca terminasse surgiu. Com base nisso, levantei muitos outros tópicos para explorar e abordar nos próximos artigos.


<br>

# Definindo Performance 

Performance, em termos simplistas, refere-se a **quão rápido e eficiente um sistema ou algoritmo pode ser ao processar uma única transação**. Isso pode ser medido de **forma isolada** ou em meio a um **grande volume de outras transações**. A aplicação prática da "performance" envolve diversos termos técnicos e complexidades dentro das disciplinas que compõem a engenharia de software em geral, sendo mais perceptível pelos usuários finais de nossas soluções.

A performance deve ser considerada em relação aos requisitos funcionais e não funcionais do sistema. Por exemplo, um sistema projetado para processamento de dados em tempo real terá diferentes expectativas de performance em comparação a um sistema de armazenamento de dados de longo prazo.

<br>

## Métricas de Performance

É crucial entender como o desempenho do sistema varia sob diferentes condições, como picos de carga, falhas de componentes ou mudanças no padrão de uso.

A avaliação de performance de um sistema ou algoritmo **requer mecanismos de monitoramento de indicadores chave**, também conhecidos como KPIs, Service Levels, entre outros. **Observar essas métricas de forma sequencial e contínua por vários períodos de tempo pode trazer ideias valiosas sobre como o sistema está operando** e dar autonomia para as times de engenharia tomarem decisões sobre design, manutenção e operação do mesmo, além de fornecer dados para identificação de tendências, fazer comparação de benchmarks, projetar e prever capacidade e identificar e priorizar quais partes precisam de melhoria de forma mais urgente.

Existem várias métricas importantes na hora de avaliar um sistema, algumas são padrões quase universais e podem ser aplicadas em quase todos os cenários, enquanto outras são provenientes de negócios e necessidades mais específicas que só são aplicadas e fazem sentido em contextos muito específicos. **Saber identificar oportunidades de métricas a serem monitoradas representa um trabalho árduo e contínuo que depende muito da maturidade e das "horas de voo" de um software**.

Para este texto, vamos trabalhar com o "feijão com arroz" das métricas de performance, também conhecidas no mercado como `Four Golden Signals`.

Os "Four Golden Signals" são um conceito dentro do monitoramento e observabilidade de sistemas, popularizado pelo Google no livro "Site Reliability Engineering" (SRE). Eles representam as quatro métricas mais importantes que você deve monitorar para entender a saúde de um sistema distribuído. Essas métricas ajudam os engenheiros a detectar problemas rapidamente e a manter sistemas estáveis e eficientes. Essas métricas são Saturação, Tráfego, Tempo de Resposta e Taxa de Erros.

Vamos abordar essas métricas não do ponto de observabilidade, pois mais adiante teremos um capítulo dedicado a esse tema onde vamos abordar esse e mais alguns conceitos de forma mais profunda, mas sim do ponto de vista de performance.


<br>

### Utilização e Saturação de Recursos

### Utilização e Saturação de Recursos

A `Saturação` de Recursos refere-se a **quanto do recurso disponível está sendo usado**. Um sistema pode estar saturado em termos de CPU, memória, disco ou mesmo um pool de conexões de rede. **Medir a saturação ajuda a prever problemas de desempenho e a entender quando é necessário escalar recursos**.

**Algoritmos que fazem uso intensivo de recursos computacionais como CPU, Memória, Disco e Rede costumam ser muito sensíveis a otimizações e degradações desses recursos**. Ter visibilidade da utilização de todas as capacidades disponíveis para um sistema é essencial para **determinar a saúde do serviço e fornecer insights sobre otimização, custos e desempenho**.

O objetivo de avaliar a saturação, juntamente com outras métricas de desempenho, nos possibilita identificar gargalos de recursos, como por exemplo, "a partir de qual porcentagem de uso de CPU meu tempo de resposta e taxa de erro começam a ser afetados?" ou "a partir de qual uso de I/O de escrita e leitura de disco meu banco de dados começa a degradar o tempo de consulta?". Responder a essas perguntas de forma eficiente evidencia a maturidade e a senioridade de equipes e produtos.

Podemos representar matematicamente a utilização e saturação de um recurso computacional disponível por meio de uma fórmula simples:

\[
\text{Utilização de Recurso} = \left( \frac{\text{Recurso Utilizado}}{\text{Recurso Disponível}} \right) \times 100
\]

Vamos imaginar um caso em que precisamos analisar o uso de memória alocada para um sistema. Basicamente, presumimos um cenário em que temos disponível para executar um algoritmo `2 GB` de RAM, ou `2048 MB`. Após coletar métricas e observar, foi constatado que o uso atual dessa memória disponível está em `1 GB`, ou `1024 MB`.

\[
\text{Utilização de Memória} = \left( \frac{1024}{2048} \right) \times 100
\]

\[
\text{Utilização de Memória} = 50\%
\]

De acordo com o cálculo no cenário hipotético, a utilização de memória do sistema está em 50% da capacidade disponível. Analisar a utilização de recursos é crucial para otimizar o desempenho, fornecendo informações necessárias para criar sistemas mais econômicos, eficientes e performáticos.


<br>

### Throughput, ou Tráfego

O `Throughput`, de maneira geral, descreve o **número de operações que um sistema consegue realizar dentro de um determinado período de tempo**. Ele mede quantas unidades de trabalho (como transações ou requisições) um determinado sistema ou algoritmo pode processar por unidade de tempo, **como requisições por segundo, vendas por minuto, arquivos por dia ou eventos por mês**. É uma métrica fundamental para entender a capacidade e o desempenho de aplicações. **Em sistemas projetados para lidar com protocolos web, o Throughput é contabilizado a partir de quantas requisições HTTP a aplicação recebeu e respondeu**.

A fórmula utilizada para calcular o throughput pode ser representada matematicamente da seguinte forma:

\[
\text{Throughput} = \frac{\text{Total de Unidades de Trabalho Processadas}}{\text{Tempo Total}}
\]

Desenhando um cenário hipotético onde um sistema recebeu `6.000` requisições no último minuto, podemos calcular o throughput **por segundo** da seguinte forma:

\[
\text{Throughput} = \frac{6000}{60}
\]

\[
\text{Throughput} = 100.00 rps
\]

Representar matematicamente o throughput do sistema é muito valioso em termos de performance, **pois nos ajuda a entender até que ponto nosso sistema consegue atender antes de começar a mudar suas métricas de aceitação de tempo de resposta e taxa de erros**. Podemos utilizar o throughput dentro de períodos lógicos de tempo para efetuar operações de escalabilidade dinâmica, como veremos na seção de **escalabilidade**.



<br>

### Tempo de Resposta

O `Tempo de Resposta` refere-se ao tempo total necessário para completar uma tarefa ou transação específica. Em sistemas escaláveis, é importante que a latência não aumente significativamente à medida que a utilização da aplicação se eleva. O tempo de resposta é composto pela soma da latência e do tempo de processamento, e é medido através de um cliente e um servidor.

A `Latência` pode ser definida como o **atraso de rede ou o tempo que uma solicitação leva para viajar do remetente ao receptor**. Em outras palavras, é o atraso entre o início de uma ação e o início da reação, podendo ser influenciado pela distância física entre os comunicantes, pela velocidade do meio de transmissão e por qualquer atraso introduzido por dispositivos intermediários, como roteadores.

O `Tempo de Processamento` é o tempo que um sistema leva para **processar uma solicitação após recebê-la**. Esse termo é frequentemente usado para descrever o tempo necessário para que uma CPU ou servidor processe uma tarefa específica.

O `Tempo de Resposta` é o **tempo total que leva desde o envio de uma solicitação até o recebimento da resposta**. Ele inclui tanto a latência (tempo de ida e volta da rede) quanto o tempo de processamento no servidor, sendo uma soma de ambos na maioria dos casos. Em um contexto de usuário final, é o tempo que leva desde que um usuário realiza uma ação (como clicar em um link ou pressionar uma tecla) até que ele veja o resultado dessa ação.

Além disso, o cálculo do tempo de resposta pode ser representado da seguinte forma, a partir do cliente, subtraindo o tempo inicial da requisição do tempo final da resposta observada:

\[
\text{Tempo de Resposta} = \text{Timestamp da Resposta} - \text{Timestamp da Requisição}
\]

Todas as três variáveis apresentadas podem ser observadas e medidas independentemente de acordo com as necessidades do ambiente, inclusive sendo uma boa prática para executar troubleshooting mais granular em investigações de problemas, como identificar em que ponto exato da transação ocorreu a degradação em questão.


<br>

### Taxa de Erros

Uma das principais métricas que podem ser utilizadas para avaliar performance, capacidade e disponibilidade de sistemas é a taxa de erros. Essa métrica pode ser utilizada junto com métricas de tempo de resposta e throughput para tirar conclusões valiosas a respeito do comportamento de um sistema.

A taxa de erros corresponde à porcentagem de todas as requisições que resultam em um erro em relação ao total de requisições. Entendemos que um sistema escalável, com capacidade planejada, **deve manter ou reduzir sua taxa de erro à medida que a carga aumenta**.

Para calcular a taxa de erros de um sistema, geralmente usamos uma fórmula simples que relaciona o número de eventos de erro com o número total de eventos ou tentativas. A taxa de erros é frequentemente expressa como uma porcentagem. Aqui está a fórmula básica:

\[
\text{Taxa de Erro} = \left( \frac{\text{Número de Erros}}{\text{Número Total de Tentativas ou Eventos}} \right) \times 100
\]

Suponha que você tenha um sistema que processou 1.000 transações, das quais 50 resultaram em erros. A taxa de erros seria calculada da seguinte forma:

\[
\text{Taxa de Erro} = \left( \frac{50}{1000} \right) \times 100
\]

\[
\text{Taxa de Erro} = 5.0\%
\]

Essa métrica é particularmente útil para avaliar a confiabilidade e a qualidade de sistemas de software, especialmente em ambientes de produção onde a estabilidade é crítica. Acompanhar a taxa de erros ao longo do tempo pode ajudar a identificar tendências, avaliar o impacto de mudanças ou atualizações no sistema e determinar áreas que podem precisar de melhorias.


<br>

# Definindo Capacidade

A capacidade, ou "capacity", no contexto da engenharia de software, refere-se à **quantidade máxima de trabalho que o sistema pode receber e processar de maneira eficaz em um determinado período de tempo**. É uma forma de medir e **encontrar o limite atual do sistema**, incluindo recursos como CPU, memória, armazenamento e largura de banda de rede, bem como a performance de algoritmos. Quando olhamos para a capacidade, monitorar os recursos e dependências pertinentes ao sistema é tão importante quanto monitorar o desempenho, principalmente quando trabalhamos em oportunidades de projetar sistemas pensados para curto, médio e longo prazo.

Este conceito é fundamental na arquitetura e no design de sistemas, bem como no planejamento da infraestrutura geral dos componentes de software. A capacidade abrange vários aspectos do sistema, que vão desde a habilidade do sistema de **processar dados ou transações**, vinculado diretamente ao **poder de processamento computacional**, **velocidade desse processamento** e eficácia e eficiência, até a **capacidade de suportar uma quantidade de usuários ou processos simultaneamente**, **sem degradação do desempenho e com a capacidade de se adaptar a cargas de trabalho crescentes**, aumentando recursos conforme necessário para manter a experiência constante em meio a variações desses cenários.

Pensar e medir a capacidade de sistemas envolve não apenas o dimensionamento adequado dos recursos computacionais do sistema, mas também a implementação de estratégias para monitoramento, observabilidade, gerenciamento de desempenho, automações e escalabilidade.


## Gargalos de Capacidade

Dentro do contexto de capacidade de software, "gargalos" referem-se a **pontos no sistema onde o desempenho ou a capacidade são limitados devido a um componente específico que não consegue lidar eficientemente com a carga atual**. Esses gargalos podem afetar negativamente a capacidade geral do sistema de funcionar de maneira otimizada e podem ocorrer em várias áreas, incluindo hardware, software ou na arquitetura de rede. Isso pode incluir **CPU insuficiente, memória, espaço em disco, capacidade de rede**, entre várias outras coisas. Por exemplo, um servidor com CPU sobrecarregada não conseguirá processar requisições rapidamente. Erroneamente, profissionais de diversos níveis de senioridade podem associar gargalos sistêmicos à infraestrutura da aplicação, porém é muito mais comum cenários onde código mal otimizado ou algoritmos ineficientes, gerenciamento de concorrência, como deadlocks ou uso excessivo de bloqueios, podem limitar a capacidade do sistema e se tornar gargalos muito difíceis de lidar e superar no dia a dia de times de engenharia.

Um design de sistema que não distribui a carga de maneira eficiente pode criar gargalos invariavelmente. Por exemplo, um ponto central de processamento de alguma rotina em uma arquitetura que deveria ter a capacidade de quebrar essa carga em várias partes e tornar-se distribuída.

\[
\text{Gargalo} = \text{Demanda} > \text{Capacidade}
\]

Identificar e resolver gargalos é crucial para otimizar a performance e a escalabilidade de sistemas de software. Isso geralmente envolve monitoramento detalhado, testes de desempenho e ajustes finos do sistema. Em ambientes de nuvem e sistemas distribuídos, a identificação de gargalos também pode incluir a análise da distribuição de carga e a escalabilidade dinâmica.

## Backpressure de Capacidade

O conceito de `"backpressure"`, ou `"repressão"` em software e, especialmente, em arquiteturas baseadas em microserviços, também pode ter várias definições dependendo de onde é empregado. Em alguns contextos, o backpressure pode ser a capacidade ou um mecanismo intencional de um sistema para gerenciar sua entrada/saída, evitando gargalos de processamento. Aqui, vamos usar a definição da engenharia física, mais precisamente da gestão de fluidos, onde o termo se refere à resistência oposta ao movimento de um fluido.

De acordo com o Wikipedia,

> Backpressure, ou Repressão, é o termo usado para definir **uma resistência ao fluxo desejado de fluido através de tubos**. Obstruções ou curvas apertadas criam **contrapressão devido a perda de atrito e queda de pressão**.

![Backpressure - Pipes](/assets/images/system-design/Back_pressure.jpg)

No contexto de software, **o backpressure ocorre quando um componente ou serviço em um sistema distribuído começa a receber mais dados ou solicitações do que é capaz de processar**. Isso pode levar a uma série de problemas, como aumento do tempo de resposta, falhas e perda de dados.

Vamos ilustrar uma solicitação em um sistema fictício que é atendida pelos Serviços `A`, `B` e `C` sequencialmente. Respectivamente, esses serviços que compõem a transação suportam `100`, `60` e `300` transações por segundo. Em uma carga de trabalho de 90 transações por segundo, todos os componentes desse sistema conseguem receber e dar vazão de forma eficiente para toda a carga de trabalho inserida sem maiores problemas.

Nesse mesmo cenário, caso esse sistema receba 100 transações por segundo, o que é suportado a níveis de capacidade por 2 dos 3 serviços do conjunto, o serviço B terá um backpressure de 40 transações a cada segundo, pois ele só suporta dar vazão a 60 delas.

![Backpressure - warning](/assets/images/system-design/Scale-Backpressure.drawio.png)

Em um cenário mais crítico, entendendo que o `serviço C` consegue suportar até 300 transações, se injetarmos 120 transações por segundo nesse conjunto, a diferença do input do serviço A para o B será de 20 transações, pois ele só suporta 100 delas nesse tempo, e em seguida, 100 dessas transações que foram repassadas para o serviço B que só suporta 60 serão represadas por capacidade computacional, fazendo com que o backpressure total dessa solicitação seja de 60 TPS, 50% de degradação entre o input inicial e output final, independentemente da capacidade do sistema mais performático de todo o fluxo, que em 100% do tempo terá sua real capacidade sempre ociosa devido aos limites de capacidade dos serviços anteriores.

![Backpressure - danger](/assets/images/system-design/Scale-Backpressure%20-%20Danger.drawio.png)

**Henry Ford** popularizou a frase que dizia que *“uma corrente é tão forte quanto seu elo mais fraco”*. O Backpressure nos ajuda a evidenciar que, por mais que existam serviços mais performáticos que outros compondo um sistema, nosso throughput e capacidade serão limitados ao componente mais degradado.


## Custo de Transação por Capacidade

Analisar o custo por transação é muito interessante para avaliar a **eficiência e o custo-benefício da capacidade alocada para o sistema**. O cálculo do custo de transação em sistemas é uma métrica financeira que avalia o custo total associado à execução de uma operação ou transação. Essa métrica é particularmente relevante quando construímos sistemas em nuvens públicas, onde as considerações financeiras são altamente sensíveis. Podemos calcular o custo de transação com base nos dados de transações totais do cliente. Normalmente, essa métrica é coletada apenas das requisições provenientes do cliente final, não sendo multiplicada pelo número de subsistemas e microserviços transparentes às interações com o cliente.

Essa métrica ajuda as organizações a entenderem melhor onde e como seus recursos estão sendo gastos e onde podem ser feitas economias ou melhorias. Ela pode ser representada pelo custo total da operação em questão dividido pelo número total de transações dentro do mesmo período de tempo.

\[
\text{Custo por Transação} = \frac{\text{Custo Total Operacional}}{\text{Total de Transações}}
\]

Em sistemas com padrões de demanda variáveis, o custo por transação pode mudar ao longo do tempo. É importante considerar os picos de demanda e como eles afetam o custo médio. **Geralmente, um custo por transação mais baixo indica maior eficiência e uso eficaz dos recursos.**


<br>

# Definindo Escalabilidade

Escalabilidade é a **capacidade de um sistema, aplicação ou negócio de crescer e lidar com um aumento na carga de trabalho, sem comprometer a qualidade, desempenho e eficiência**. Isso pode incluir o aumento de usuários, transações, dados ou recursos. É um atributo crítico para sistemas que esperam um aumento no volume de usuários ou dados. É uma característica de design que indica quão bem um sistema pode se adaptar a cargas de trabalho maiores ou menores.

De acordo com o livro *"Release It!" de Michael T. Nygard*, a escalabilidade pode ser definida de duas formas: A primeira forma descreve como o *Throughput* muda de acordo com variações de demanda, utilizando um gráfico de *requests por segundo* comparado com *tempo de resposta* de um sistema. A segunda forma se refere aos modos de escala que um sistema possui. Aqui, assim como no livro, vamos definir escalabilidade como a **capacidade de adicionar ou remover capacidade computacional a um sistema**. 

A escalabilidade é um conceito importante no design de sistemas, pois é crucial para garantir que as aplicações e produtos possam lidar com um aumento na carga de trabalho sem sacrificar a qualidade ou o desempenho. Isso é especialmente importante em ambientes de nuvem, onde as demandas podem mudar rapidamente e os sistemas devem ser capazes de se adaptar a essas mudanças.

## Importância da Escalabilidade em Sistemas Modernos

A escalabilidade permite que os sistemas se adaptem rapidamente a mudanças no volume de tráfego ou demanda de recursos, garantindo um desempenho consistente mesmo sob carga variável. Em ambientes de negócios dinâmicos, a capacidade de escalar recursos conforme necessário é crucial para manter a continuidade e a eficiência operacional. Além disso, permite manter tempos de resposta rápidos e desempenho confiável, mesmo sob cargas leves, médias e pesadas, resultando em uma experiência de usuário mais satisfatória.

Sistemas escaláveis podem ser mais econômicos, pois permitem um dimensionamento eficiente de recursos. Isso significa pagar apenas pelos recursos que são usados, reduzindo o desperdício e otimizando os custos operacionais. Além disso, facilita a implementação de novas funcionalidades e a expansão de negócios sem a necessidade de reestruturar completamente a infraestrutura existente já projetada.


## Escalabilidade Vertical e Escalabilidade Horizontal

Existem dois tipos principais de escalabilidade frequentemente discutidos no design de sistemas: a `Escalabilidade Horizontal` e a `Escalabilidade Vertical`. Vamos usar este tópico para discutir a terminologia em torno desses conceitos.

Para ilustrar essas ideias, consideremos um exemplo lúdico de uma empresa que gerencia uma frota de ônibus. Essa empresa tem como missão levar passageiros de um ponto A a um ponto B dentro da cidade. Inicialmente, a empresa investiu em uma frota que comportava aproximadamente 100 passageiros simultaneamente por horário de ônibus. Recentemente, esse número de passageiros aumentou gradualmente, levando a filas de espera nos pontos de embarque, atrasos e reclamações constantes. Com base nesse cenário, vamos começar a explorar os exemplos de escalabilidade.


### Escalabilidade Vertical

![Escalabilidade Vertical](/assets/images/system-design/onibus-vertical.png)

Uma das abordagens consideradas para resolver os problemas de superlotação dos ônibus foi substituir alguns veículos da frota por ônibus de 2 andares, o que dobraria a capacidade de cada veículo para transportar passageiros. Esse paralelo exemplifica como funciona a escalabilidade vertical.

Podemos entender a escalabilidade vertical como o **processo de aumentar a capacidade de um componente, adicionando ou removendo mais recursos desse mesmo componente**. A escalabilidade vertical geralmente envolve **aumentar a capacidade de CPU, RAM, disco ou rede de um único recurso**, mas não se limita apenas a isso; também pode incluir otimizações em algoritmos para aumentar a capacidade de processamento de entrada/saída. Embora seja uma solução mais simples, a escalabilidade vertical frequentemente encontra limitações físicas e de custo.

Em resumo, no design de sistemas que se baseiam na escalabilidade vertical, o foco está na **maximização do processamento e eficiência de um único servidor ou recurso**. Isso pode incluir a otimização de algoritmos e a escolha de tecnologias que maximizem o uso da CPU e da memória.

![Escalabilidade Vertical](/assets/images/system-design/scale-up.png)

#### Scale Up e Scale Down

As operações de `Scale-up` e `Scale-down` são atividades que ocorrem no contexto da escalabilidade vertical. Elas envolvem o aumento ou redução dos recursos computacionais de um servidor específico que desempenha determinada funcionalidade. A operação de `Scale-up` *(escalonar para cima)* refere-se ao ato de **aumentar recursos**, como CPU, memória, disco ou rede, para um servidor. Por outro lado, a operação de `Scale-down` *(escalonar para baixo)* envolve o **reduzir esses recursos** quando necessário. Em resumo, `Scale-up` significa adicionar mais recursos de hardware, aumentando o número de CPUs, a quantidade de memória RAM ou a capacidade de armazenamento do servidor, enquanto `Scale-down` está relacionado a diminuir esses recursos quando apropriado.


### Escalabilidade Horizontal

![Escalabilidade Horizontal](/assets/images/system-design/onibus-horizontal.png)

Outra proposta considerada para resolver o problema da superlotação de passageiros foi investir em mais unidades dos modelos de ônibus existentes em vez de substituir a frota por modelos que comportassem mais passageiros. Isso resultaria em mais veículos operando na rota, distribuindo os passageiros entre eles. Esse paralelo pode ser facilmente associado à forma como a escalabilidade horizontal funciona.

A escalabilidade horizontal **refere-se à adição de mais nós, como servidores, contêineres ou réplicas, a um componente ou sistema existente**. Isso é conhecido como "scale out". Por exemplo, se você estiver executando uma aplicação web em um único nó e começar a receber muito tráfego, poderá adicionar mais réplicas ao sistema para compartilhar a carga de trabalho, normalmente usando um [Balanceador de Carga](/load-balancing/). Esse método é chamado de escalabilidade horizontal e pode ser implementado de forma eficaz com ferramentas de escalabilidade automática.

Para implementar a escalabilidade horizontal de forma eficaz, os sistemas devem ser projetados com uma arquitetura distribuída que seja capaz de processar solicitações com paralelismo externo.

![Escalabilidade Horizontal](/assets/images/system-design/scale-out.png)

#### Scale Out e Scale In

As operações de `Scale-out` e `Scale-in` são atividades que se enquadram na escalabilidade horizontal. `Scale-out` (escalar para fora) refere-se a **aumentar o número de servidores ou réplicas** que desempenham a mesma função, distribuindo assim a carga de processamento entre eles. `Scale-in` (escalar para dentro) é a operação inversa, onde **reduzimos o número de servidores ou réplicas** no pool de máquinas. Em resumo, `Scale-out` (para fora) envolve o aumento do número de servidores, enquanto `Scale-in` (para dentro) envolve a diminuição desse número. Essas duas operações podem ser usadas em conjunto para ajustar dinamicamente a capacidade da carga de trabalho.



# Capacity Planning e Escalabilidade

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

## Escalabilidade de Software

Como já comentado, o conceito de escalabilidade poder ir muito além de ajustar elasticamente uma infraestrutura para lidar com demandas específicas. A escalabilidade é amplamente aplicada na arquitetura de software e tem papel fundamental que anda "de mãos dadas" a escalabilidade de infraestrutura. É um erro muito grande associar conceitos de escalabilidade apenas a componentes e dependência de infraestrutura. Olhar para escalabilidade quando se projeta um software levando em conta arquitetura, necessidades e fluxos de negócios é essencial para projetar soluções modernas sem elevar o custo de operação das mesmas de forma exponencial. 

Uma das formas mais diretas de melhorar a performance é **otimizar os algoritmos do código existente**. Isso inclui refinar algoritmos para reduzir a complexidade computacional, eliminar gargalos de processamento e melhorar a eficiência de uso da memória e avaliar oportunidade de paralelismo e tarefas concorrêntes. 

Otimizar esquemas de banco de dados, índices e consultas pode reduzir significativamente o tempo de resposta e aumentar a capacidade e escalabilidade de um sistema. O mesmo vale para distribuição de carga entre vários servidores disponíveis que estejam aptos a processar uma tarefa, considerar o uso de bancos de dados NoSQL ou soluções de armazenamento distribuído para cenários de alta demanda, implementar caching onde apropriado pode reduzir significativamente o tempo de resposta e a carga sobre os sistemas de backend. Isso pode incluir caching em memória, caching distribuído e otimizações de cache no lado do cliente. Para processamento de tarefas pesadas ou operações de I/O, usar filas e mensagens assíncronas para distribuir a carga e melhorar a eficiência geral do sistema.

São muitas as possibilidades que permeiam a escalabilidade, e ao integrar essas estratégias ao desenvolvimento e manutenção de software, é possível criar sistemas não apenas mais escaláveis, mas também mais eficientes e confiáveis. Isso requer um compromisso contínuo com a qualidade do código, a arquitetura do sistema e o monitoramento contínuo, garantindo que o sistema possa se adaptar e evoluir com as demandas crescentes.

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

[Livro: Engenharia de Confiabilidade do Google: Como o Google Administra Seus Sistemas de Produção](https://www.amazon.com.br/Engenharia-Confiabilidade-Google-Administra-Sistemas/dp/8575225170/ref=asc_df_8575225170/?tag=googleshopp00-20&linkCode=df0&hvadid=379787347388&hvpos=&hvnetw=g&hvrand=6082686845870695900&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9100425&hvtargid=pla-809202560056&psc=1&mcid=af7c2201dacb3b4dadd5fdd4007a440e)

{% include latex.html %}