---
layout: post
image: assets/images/system-design/async.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Mensageria, Eventos, Streaming e Arquitetura Assincrona
---

Arquiteturas assíncronas derivadas do uso de mensageria e eventos são recursos muito valiosos quando arquitetamos soluções complexas de sistemas distribuídos. Assim como os dois capítulos anteriores, onde falamos sobre [protocolos e padrões de rede](/protocolos-de-rede/) e [padrões de comunicação síncronos](/padroes-de-comunicacao-sincronos/) em sistemas, esse tópico também visa detalhar comunicações entre componentes de uma arquitetura de serviço, mas com uma abordagem de comunicação assíncrona. Vamos detalhar e diferenciar alguns tópicos importantes, como Mensagens e Eventos, e como utilizá-los para resolver problemas de comunicação em larga escala utilizando protocolos como MQTT, AMQP, comunicação assíncrona over-TCP com o Kafka, arquitetura desses componentes, assim como suas vantagens e limitações.


<br>

# Mensagens e Eventos

A comunicação em sistemas distribuídos de forma assíncrona pode ser categorizada e simplificada através de duas formas: **mensagens e eventos**. A função da comunicação assíncrona, assim como qualquer tipo de comunicação, **visa trocar dados e comandos entre diversos componentes que compõem um sistema**, e tanto mensagens quanto eventos cumprem esse objetivo de forma louvável, mesmo ambas possuindo peculiaridades, conceitos e características distintas que podem complementar ou mudar totalmente um padrão de design de comunicação entre sistemas. Ambas podem ser empregadas para **distribuir cargas de trabalho de forma assíncrona entre vários consumidores que podem trabalhar paralelamente para processar itens de um mesmo domínio**, assim como os [balanceadores de carga](/load-balancing/) de forma ultra-superficial e simplista, que por sua vez se encarregam de cumprir o mesmo objetivo de forma síncrona.


<br>

## Definindo Mensageria 

![Exemplo Mensagem](/assets/images/system-design/Mensageria-Exemplo.png)

Mensageria, em termos simplistas, refere-se à troca de mensagens através de componentes intermediários. Ela se baseia na produção e consumo, onde um produtor interessado em notificar e estimular comportamentos em outro componente subsequente, envia os dados necessários para que essa finalidade seja concluída com êxito, e esses dados são enfileirados em uma queue, ou fila, onde são recebidos pelo sistema destino de forma ordenada, ou não. Estabelecer um canal comum entre o destinatário e remetente da mensagem é uma premissa para que esse tipo de abordagem funcione bem.

Mensagens geralmente são **construídas para trabalharem de forma imperativa**, onde eu **"envio uma mensagem para um sistema de e-mail, e espero que esse sistema envie o e-mail para o destinatário especificado com o conteúdo fornecido"**, ou também **"envio uma mensagem para meu sistema de atualização cadastral de usuários, onde esse sistema ao receber a mensagem atualiza o cliente existente na base comum desse domínio com as informações enviadas de forma assíncrona"**, ou **"envio os dados de uma compra para um sistema de faturamento, ao receber essa mensagem de uma compra, o sistema responsável realiza todas as tarefas esperadas"**. Em todos os casos, uma mensagem na grande maioria das vezes possui um destinatário conhecido e intencional, que é capaz de tomar ações sobre o dado fornecido conforme o produtor da mensagem espera. Conceitualmente, mas não sempre, um para um.

Uma alusão para o conceito de mensageria, de fato, é **pensar em uma carta**, correspondência ou pacote de uma encomenda. Onde ela tem um destinatário único e conhecido. Imagine que você recebe por correio, de meios formais, um envelope que te notifica do casamento de um amigo próximo te convidando para ser padrinho. É uma mensagem especialista enviada unicamente e exclusivamente para pessoas pelas quais esse amigo tem carinho o suficiente para ser apadrinhado. Pode-se esperar que convidados normais também tenham recebido uma carta por correio, mas com o convite normal, mas com um conteúdo diferente, apenas os convidando para a cerimônia. Podemos imaginar que os noivos utilizaram duas filas: uma para padrinhos, e outra para os demais convidados.


<br>

## Definindo Eventos

![Exemplo Evento](/assets/images/system-design/Eventos-Exemplo.png)

Ao contrário das mensagens que são conteúdos entregues de forma intencional para destinos conhecidos com comportamentos controlados e esperados, **um evento pode ser tratado como uma notificação genérica de que algo ocorreu**, e diversas partes de um sistema complexo que estejam interessadas nesse tipo de evento, **escutam essa notificação e tomam suas devidas ações, se necessário**, ou não. Ao contrário das mensagens que trafegam suas informações de um para um através de filas, **os eventos são trafegados através de tópicos, onde o conteúdo desse evento chega ao mesmo tempo, para todos os interessados no assunto do tópico**. Mensagens podem introduzir um nível maior de acoplamento entre o emissor e o receptor, especialmente se o formato da mensagem ou o protocolo de comunicação exigir que ambos os lados concordem com um contrato comum. **Eventos tendem a promover um desacoplamento maior, pois o emissor não precisa saber quem está consumindo o evento ou como**. Essa é uma forma de mensageria que garante baixo acoplamento entre sistemas, e facilita a escala e criação de novos componentes e subsistemas.

Eventos são utilizados próximos de streaming, e **esperam que espectadores reajam a uma notificação assim que ela ocorre para executar suas funções**. Ao lado da mensageria, onde em um exemplo de e-commerce teríamos filas específicas para cobrar, faturar, enviar o e-mail, notificar o estoque e o produtor teria que enviar pontualmente a mensagem específica para cada uma delas, quando olhamos para arquitetura de eventos, teríamos um evento próximo de um **"uma venda aconteceu!!!, sistemas interessados nisso, podem trabalhar"**, e **o sistema de cobrança, faturamento, e-mail e estoque respondem a isso de forma simultânea e isolada**.

Uma alusão a eventos seria **o mestre de cerimônias da festa do casamento**, ou mesmo o **DJ da pista que anuncia todos os eventos que estão para acontecer**. Como por exemplo ele vai até o microfone e **anuncia o horário da valsa dos padrinhos, do buquê da noiva, da gravata, do sapatinho e do esperado jantar estar sendo servido**, e todos os interessados nesses eventos tomam suas devidas ações em prol dos mesmos, se locomovendo para os locais indicados, seguindo as instruções, etc.


<br>

## Eventos vs Mensagens

Por mais que ambos os conceitos andem próximos em definições de arquiteturas, e comumente sejam até confundidos e intercambiáveis, onde tópicos de eventos sejam usados como filas, e filas sejam usadas como eventos de forma errônea, ou não, **entender as diferenças e pontos fortes de cada uma dessas alternativas pode fazer com que engenheiros e arquitetos projetem soluções ainda mais escaláveis e performáticas**. Com esse objetivo, vamos analisar os paralelos entre eventos e mensagens de forma conceitual, lado a lado. A principal diferença conceitual que permeia mensagens e eventos, como vimos, é o **propósito imperativo e o propósito reativo**. Enquanto **mensagens são concentradas em enviar mensagens para atores específicos com uma abordagem imperativa e direta de "faça algo"**, **eventos trabalham de forma reativa e desacoplada, onde temos a abordagem de "aconteceu algo", e os membros reativos tomam as devidas decisões com base nisso**.

Mensagens são geralmente usadas para **transferir dados de um ponto a outro**, frequentemente com a expectativa de uma resposta ou reação de alguma forma. Eventos, por outro lado, **são emitidos para informar outros componentes do sistema sobre mudanças de estado**, sem esperar uma resposta. Muitas vezes em arquiteturas reativas a eventos, **o responsável pela produção do evento não conhece todos os seus consumidores e quais ações os mesmos tomam**, pois a fonte do evento é de uma para muitas, não exigindo confirmação ou conhecimento prévio. Eventos são ideais **para a construção de sistemas reativos que respondem a mudanças de estado**, como **"o estado de determinada compra se tornou CANCELADO"**, enquanto **mensagens são mais adequadas para integrações diretas** onde uma ação específica é requerida aos dados enviados, como **"cancele essa compra"**.


<br>

# Conceitos e Padrões

![Conceitos](/assets/images/system-design/mensageria-conceitos.png)

Tanto em ferramentas que possibilitam o uso de mensageria quanto eventos e streaming, alguns conceitos podem estar presentes de forma singela em ambos os casos. Nesta sessão, vamos detalhar alguns deles para que, conceitualmente, seja possível guiar as melhores decisões arquiteturais.

<br>

## FIFO e Queues - First In First Out

O padrão FIFO, ou *First In First Out*, é um conceito muito presente em tecnologias de mensageria e processamento de filas, onde neste modelo, podemos entender que as **mensagens serão tratadas na forma de uma fila literal**, onde **a primeira mensagem a chegar, será consequentemente a primeira a ser disponibilizada para consumo**. Este padrão pode ser habilitado e adotado em mensageria em casos de uso onde uma **ordem mínima de processamento precisa ser garantida**, pois a ordem do consumo representa exatamente a ordem de chegada da mensagem. O FIFO é uma estrutura interessante para ser empregado em sistemas financeiros, onde **a ordem de execução de um grupo de transações precisa ser respeitada**, ou em sistemas de vendas onde a ordem de compra **precisa ser tratada de forma justa pela ordem de confirmação**.

![Queue](/assets/images/system-design/queue.png)

As operações conhecidas dentro da estrutura de dados de Queue geralmente são conhecidas como `Enqueue`, que se encarrega de adicionar um item ao fim de uma lista ou fila, e o `Dequeue`, que se encarrega de remover o primeiro item da lista ou fila. Abaixo temos um funcionamento simples de uma implementação de Queue FIFO para compreendermos a lógica da estrutura:


```go
package main

import (
	"fmt"
)

// Interface genérica para implementar os métodos de enfileiramento
type Queue []interface{}

// Adiciona um item na fila
func (q *Queue) Enqueue(item interface{}) {
	*q = append(*q, item)
}

// Remove o primeiro item da fila e o retorna
func (q *Queue) Dequeue() interface{} {
	if len(*q) == 0 {
		return nil
	}
	item := (*q)[0]
	*q = (*q)[1:]
	return item
}

func main() {
	queue := Queue{}

	// Itens a serem adicionados na Queue
	items := []string{
		"Pizza",
		"Hamburger",
		"Churrasco",
	}

	// Adicionando os itens na ordem da lista
	for _, item := range items {
		fmt.Println("Input:", item)
		queue.Enqueue(item)
	}

	fmt.Println()

	// Removendo os itens em ordem de chegada na lista
	fmt.Println("Output:", queue.Dequeue())
	fmt.Println("Output:", queue.Dequeue())
	fmt.Println("Output:", queue.Dequeue())
}
```

##### Output: 

```
Input: Pizza
Input: Hamburger
Input: Churrasco

Output: Pizza
Output: Hamburger
Output: Churrasco
```

<br>

## LIFO e Stacks - Last In First Out

Por mais que o padrão LIFO, ou *Last In First Out*, seja empregado também em Queues no conceito de mensageria, em estruturas de dados esse padrão pode ser associado a uma Stack. Ao contrário do FIFO, onde temos uma percepção de uma fila literal, onde o primeiro a chegar é o primeiro a ser atendido, o LIFO nos oferece uma **experiência de uma Pilha**, onde **a última mensagem a ser incluída será a primeira a ser consumida na priorização**. Por mais que, pelos exemplos que vimos até então, o conceito de LIFO seja anti-intuitivo quando olhamos para o conceito de distribuição de cargas de trabalho, desacoplamento e processamento em batch, ele pode ser implementado em funcionalidades que requerem uma ação de "desfazer", onde precisamos preservar uma "memória" de etapas de um processamento que precisa ser desfeita na ordem inversa, como por exemplo um processo de cálculos de descontos dentro de um plano com múltiplas condições e regras.

![Stack](/assets/images/system-design/stack.png)

De forma simplista, a principal diferença entre uma queue e uma stack é o sentido da remoção dos itens da lista. Uma stack é uma queue ao contrário, e vice-versa. As operações conhecidas dentro dessa estrutura de dados são geralmente definidas como `Push`, onde adicionamos um item no início da pilha, e `Pop`, onde retiramos o primeiro item da mesma.


```go
package main

import (
	"fmt"
)

type Stack []interface{}

// Adiciona um item na pilha
func (s *Stack) Push(item interface{}) {
	*s = append(*s, item)
}

// Remove o item do topo da pilha e o retorna
func (s *Stack) Pop() interface{} {
	if len(*s) == 0 {
		return nil
	}
	index := len(*s) - 1
	item := (*s)[index]
	*s = (*s)[:index]
	return item
}

func main() {
	stack := Stack{}

	// Itens a serem adicionados na Stack
	items := []string{
		"Pizza",
		"Hamburger",
		"Churrasco",
	}

	// Adicionando os itens na pilha
	for _, item := range items {
		fmt.Println("Input:", item)
		stack.Push(item)
	}

	fmt.Println()

	// Removendo os itens da pilha
	fmt.Println("Output:", stack.Pop())
	fmt.Println("Output:", stack.Pop())
	fmt.Println("Output:", stack.Pop())
}
```

##### Output: 

```
Input: Pizza
Input: Hamburger
Input: Churrasco

Output: Churrasco
Output: Hamburger
Output: Pizza
```

## Fanout 

O padrão de Fanout é um pattern empregado onde é **necessária uma estratégia de 1:N no envio de mensagens**. Isso pode ser aplicado em mensageria quando temos **uma única mensagem que precisa ser distribuída para um número maior de filas**, ou quando observamos o comportamento padrão de um evento, em que a mesma mensagem é repassada para todos os grupos de consumidores com funções diferentes interessados no mesmo tópico. Em termos simplistas, o **Fanout é enviar a mesma mensagem para todos os lugares possíveis dentro de algum contexto que faça sentido**.

Esse padrão é útil, como citado, quando precisamos notificar a mesma mensagem para vários grupos, tanto para replicação de dados, onde por intermédio de alguma carga de trabalho secundária, replicamos o processamento ou o dado para outros tipos de bancos de dados, datacenters e subsistemas.

## DLQ - Dead Letter Queues

As **Dead Letter Queues são mecanismos de post-mortem de mensagens** que não conseguiram ser processadas. Elas são utilizadas para **centralizar mensagens que, porventura, falharam em ser consumidas durante seu ciclo de vida**, seja por erros, timeouts para serem confirmadas ou quantidade de tentativas excedidas. Utilizar as DLQs permite aos times de engenharia que suportam sistemas que fazem uso de mensageria, analisar e tratar os casos de insucesso das integrações sem criarem um overhead desnecessário de tentativas infinitas na fila principal, ou até mesmo recolocando-as na fila principal depois de tratamentos em caso de uma indisponibilidade em um subsistema que demorou tempo demais para se reestabelecer e automaticamente moveu suas mensagens até ela.

![DLQ](/assets/images/system-design/dlq.png)

Implementar DLQs nos permite, através de estratégias de monitoramento, identificar um possível problema nos sistemas que se comunicam dessa forma, uma vez que não faz parte do fluxo padrão encaminhar uma grande quantidade de mensagens para elas. Observar o número de mensagens disponíveis em DLQs durante o tempo pode ser um indicador chave em sistemas assíncronos.


## Processamento em Batch

Os processamentos em batch podem ser considerados, em termos arquiteturais de software, como o motivo seminal pelo qual as comunicações assíncronas foram criadas, evoluindo até os termos mais complexos e modernos disponíveis hoje para projetar sistemas. Processar em batch é uma estratégia na qual uma ou um grupo de tarefas processa de uma vez um lote de dados acumulado dentro de um período de tempo.

Processamentos bancários normalmente ocorrem em batch durante horários que evitam os picos de uso. Essa abordagem também é comum em sistemas que processam relatórios gerenciais no fechamento de períodos estratégicos, fechamentos contábeis, de caixa, etc., onde muitos lançamentos, notas fiscais e transações efetuadas em tempo real são acumulados para serem contabilizados de fato em lote.

**Devido ao seu modo de operação autônomo, os sistemas de batch devem possuir robustos mecanismos de gerenciamento de erros e recuperação de falhas para garantir que os processos possam ser retomados ou refeitos em caso de falha**. Devido ao grande volume de dados que esses tipos de cargas de trabalho normalmente processam, lidar com erros fatais pode gerar prejuízos financeiros e estratégicos significativos devido a atrasos e prazos.

<br>

# Protocolos e Arquiteturas de Eventos

Protocolos e arquiteturas de eventos, ou event-driven, são ferramentas extremamente úteis em ambientes distribuídos e podem facilitar o processamento e análise de volumes significativos de dados em tempo real, ou muito próximo disso.

<br>

## Streaming e Reatividade

O Streaming de dados pode ser considerado um padrão que visa **realizar o processamento de um fluxo contínuo de dados que são gerados em tempo real**. Diferente de processamentos em batch, que lidam com blocos de dados estáticos, o streaming visa abordar a mesma quantidade de dados, ou até maiores, em tempos muito próximos dos que foram gerados. Streaming engloba tecnologias e padrões de projetos que possibilitam escrever aplicações que se utilizam de reatividade para realizar suas funções e lidar com esses mesmos dados e eventos.

Um exemplo clássico, mas não limitado a isso, é a implementação de streaming em redes sociais e ferramentas de monitoramento de comportamento de usuários, onde acessos e cliques que acontecem dentro de suas plataformas são transformados em eventos analíticos, que assim que são produzidos, são processados e catalogados para enriquecer relatórios analíticos e algoritmos de recomendação. **Um simples clique em um botão, a busca por um termo específico, a altura de uma rolagem na página pode ser um evento capturado, transformado e processado quase no mesmo instante que ocorrem**.

Outro exemplo interessante e clássico são sistemas de fraude, que de acordo com o padrão de comportamento e compra conhecido, podem capturar detalhes, valores e métodos de pagamento para classificar se determinada transação é uma fraude ou está ocorrendo de forma legítima, ou uma plataforma de streaming que com base no seu histórico de navegação e títulos consumidos de séries e filmes pode automaticamente recomendar itens parecidos sem precisar de um bloco de tempo grande para tomar essas decisões.

<br>

### Reatividade e Arquiteturas Event-Driven

Aplicações orientadas a eventos, ou event-driven, são projetadas para **detectar eventos, vindos ou não de streaming, e serem estimuladas para tomar alguma decisão com base nisso**. Várias **aplicações e processos podem responder ao mesmo evento de forma totalmente independente**. Esse tipo de arquitetura, ou grupo de padrões, são úteis e bem-vindos em aplicações que interagem em **ambientes de constante mudança**, ou **reagem a mudanças de estado de vários objetos trafegados no sistema**. A capacidade de **vários atores responderem a eventos em tempo real** pode tornar o desacoplamento de sistemas produtivos de larga escala uma tarefa muito mais interessante e eficiente. Imagine que vários sistemas distribuídos e com diferentes finalidades monitoram, através de um sistema de notificações, a mudança de status de um pedido realizado em uma plataforma de delivery de comida. Um grupo de listeners pode responder quando o pedido está com o status `CRIADO`, onde podem notificar o backoffice do restaurante, mandar notificações push para o usuário; outro grupo pode responder quando o status muda para `ACEITO`, onde o processamento de cobrança é iniciado no meio de pagamento escolhido; outro grupo responde quando o status muda para `PRONTO`, notificando os entregadores disponíveis; mais grupos tomam decisões com base na mudança do status para `A_CAMINHO`, `ENTREGUE`, `FINALIZADO`, etc.

<br>

## Kafka

O Apache Kafka, embora não seja a única opção, é talvez a mais conhecida e associada a arquiteturas orientadas a eventos. O Kafka é uma plataforma de streaming projetada intencionalmente para lidar com um volume alto de dados, garantindo performance e alta disponibilidade. O Kafka é composto inicialmente por alguns componentes importantes, e entre os componentes e conceitos mais importantes, podemos encontrar:

### Clusters e Brokers

Um cluster de Kafka é composto por múltiplos servidores, onde cada um deles é considerado um "nó" e denominado como "broker". Esse grupo de brokers que formam o cluster é responsável por receber, armazenar, replicar e distribuir os eventos recebidos entre si em tópicos e suas devidas partições, bem como tem a responsabilidade de distribuir e disponibilizar os mesmos para todos os membros de grupos de consumidores conectados. Todos os brokers são aptos a receber qualquer tipo de evento e enviá-los para o tópico informado. A distribuição de carga entre os brokers pode ser facilitada por meio de [balanceadores de carga](/load-balancing/), [CNAMES de DNS](/protocolos-de-rede/) ou fornecendo a lista de brokers separados por vírgula para os clientes.

![Kafka Clusters e Brokers](/assets/images/system-design/kafka-cluster.png)


### Tópicos

Um tópico dentro da arquitetura do Kafka pode ser considerado como uma "categoria" ou um "assunto", muito próximo do que entendemos como um "feed" de eventos, no qual mensagens com um certo contexto são publicadas e associadas. Eles são os motores das arquiteturas reativas orientadas a eventos. Os tópicos do Kafka podem ter vários assinantes que se inscrevem neles para receber cópias desses dados à medida que são publicados. Os tópicos são distribuídos e balanceados entre diferentes partições para permitir que um grupo maior de consumidores de um mesmo grupo possa dividir a carga de trabalho entre si.

Como os tópicos são representações de um feed de dados de um determinado assunto ou contexto específico, é importante que os mesmos sejam criados com uma nomenclatura consistente e clara, facilitando a compreensão de que tipo de dados trafegam ali. Nomenclaturas e clareza para exemplificar domínios e dados são fatores chave para a construção de sistemas distribuídos de larga escala e que envolvam muitos times.

![Kafka Tópicos](/assets/images/system-design/kafka-topics.png)

### Partições

Partições podem ser vistas como subdivisões de um tópico, garantindo uma distribuição e balanceamento de carga entre todos os dados enviados. Como citado na sessão anterior, as partições dentro de um tópico permitem que dados sejam divididos e distribuídos entre múltiplos brokers do cluster, permitindo que sejam associados a múltiplos consumidores de um mesmo grupo, gerando toda a capacidade de paralelismo proposta pela arquitetura distribuída orientada a eventos. Cada consumidor pode ler uma ou mais partições em paralelo.


![Kafka Partitions](/assets/images/system-design/kafka-partitions.png)

### Fatores de Replicação

Os fatores de replicação, ou replication factor, são o que permite a alta disponibilidade dos eventos enviados a um tópico. Essa configuração é efetuada diretamente nos tópicos quando são criados ou alterados, e garante que uma cópia de um mesmo dado possa ser mantida em diferentes brokers do cluster. Cada partição tem um broker do cluster que atua como líder da mesma e tem a função de gerenciar todas as operações de replicação passiva para os brokers seguidores do tópico, bem como as operações de leitura.

Se um tópico é configurado com um replication factor de 2, isso significa que duas cópias do mesmo dado serão mantidas em brokers diferentes, incluindo o dado "original". Isso significa uma cópia adicional além dele. O mesmo ocorre para o replication factor de 3, onde são criadas 2 réplicas adicionais ao dado original, totalizando 3.

![Kafka Replication Factor](/assets/images/system-design/kafka-replication.png)

Uma consideração importante é que o fator de replicação de um tópico nunca deve exceder o número de brokers que compõem o cluster.

### Producers

Os producers, ou produtores, **são componentes ou processos que publicam eventos diretamente para um tópico específico dentro do Kafka**. Os producers **podem especificar em qual partição desejam enviar o evento manualmente através de uma chave de partição, ou permitir que o próprio Kafka se encarregue de fazer a distribuição uniforme**.

Especificar uma chave de partição para publicar a mensagem em tópicos específicos permite, por exemplo, **que todos os eventos vindos de um determinado cliente, subsistema ou produto sejam tratados sempre pelo mesmo consumidor conectado, o que pode ser muito útil quando uma experiência de "continuidade" ou "ordem" é necessária durante um processamento**. No entanto, isso também pode gerar "hot partitions" na distribuição desses eventos, desbalanceando a carga de trabalho dos consumidores. Nesse caso, em cenários de produção uniforme, talvez seja mais indicado confiar nos algoritmos de distribuição nativos do Kafka para evitar gargalos em certas partições.

Ao considerar os consumidores, precisamos pensar no replication factor para **encontrar um equilíbrio entre disponibilidade e performance**. Durante a produção do evento, o produtor precisa **especificar o limite mínimo de ACKs** (Acknowledgments) que ele precisa receber dos brokers. Se, por exemplo, for especificado um volume de ACK igual a 0, isso significa maior throughput de produção, em sacrifício da garantia de entrega do evento, uma vez que o produtor não irá esperar a confirmação dos brokers de que os eventos foram produzidos e salvos. **Quanto maior o número de ACKs definidos, maior a confiabilidade de entrega e menor o throughput**. Quanto menor o número de ACKs definido, maior o throughput e menor a confiabilidade de entrega. 

Para produção pode ser considerado o uso de batchs de eventos para aproveitar uma unica solicitação para produzir um lote de muitas mensagens. Especificar o tamanho do batch pode ter um impacto significativo em performance, throughput e sobrecarga de rede, porém pode impactar em tempo de resposta e uso de memória. Junto a definição do tamanho do batch, talvez seja interessante especificar o `linger time` do produtor, que funciona como um tempo maximo para bufferizar os dados em memória antes de enviar o batch, basicamente um tempo para considerar o acumulo de eventos. Isso significa que mesmo que você defina um batch size de 1000 eventos ao lado de um linger time de 200ms, se o produtor acumular um número menor de eventos, como 300, 400 até o timeout, ele irá considerar e enviar o batch para evitar represar muitos eventos em memória. 

### Consumers e Consumer Groups

Ao contrário dos producers, os consumers, ou consumidores, leem registros inseridos em uma ou mais partições de um tópico para processá-los. Para permitir múltiplas leituras de um mesmo dado por consumidores com propósitos diferentes, os consumidores se organizam em grupos chamados "consumer groups", identificados nominalmente. Cada registro entregue em uma partição é entregue a um único consumidor dentro de cada "consumer group" associado ao tópico. O Kafka gerencia a distribuição de registros e o particionamento entre os consumidores automaticamente, rebalanceando as partições entre os consumidores conforme necessário.

Um consumidor pode consumir dados de uma ou mais partições em paralelo, porém o número máximo de consumidores ativos em partições nunca poderá exceder o número de partições de fato. Caso você tenha um tópico com 9 partições e 9 consumidores trabalhando, cada um em uma delas, isso significa que você atingiu o número máximo de atores trabalhando no consumo. Mesmo que você tenha 20, 30, 40 ou 50 réplicas disponíveis desses consumidores, apenas 9 delas estarão de fato trabalhando. Embora esse tipo de arquitetura consiga processar um volume muito alto de eventos em um curto período de tempo, a escala horizontal de consumidores sempre será limitada ao número de partições disponíveis.

![Kafka Consumer Groups](/assets/images/system-design/kafka-consumer-groups.png)


<br>

## R2DBC

<br>

# Protocolos e Arquiteturas de Mensageria

Os protocolos de mensageria desempenham papéis na facilitação da comunicação entre sistemas distribuídos, permitindo a troca eficiente de mensagens de forma assíncrona. Dois dos protocolos mais importantes nesta categoria são o **MQTT** (*Message Queuing Telemetry Transport*) e o **AMQP** (*Advanced Message Queuing Protocol*). Esses protocolos são projetados para otimizar o tráfego de dados, garantir a entrega de mensagens e suportar padrões de comunicação flexíveis, confiáveis e performáticos. Normalmente, as comunicações que utilizam HTTP têm uma responsabilidade síncrona de solicitação e resposta, usadas onde é necessário receber do servidor uma resposta imediata para a transação solicitada. Porém, em termos de performance, os protocolos que possibilitam comunicações assíncronas podem nos ajudar a estender as capacidades de processamento em background de tarefas custosas, paralelizar e distribuir tarefas entre diversos microserviços com diferentes possibilidades necessárias para completar a solicitação, e continuar o trabalho de uma solicitação inicialmente síncrona em background, entre diversas outras possibilidades. Aqui falaremos inicialmente de como funciona o protocolo. Em breve, falaremos mais detalhadamente da aplicação e implementação de tarefas assíncronas em engenharia de fato.

<br>

## MQTT (Message Queuing Telemetry Transport)

O **MQTT** (*Message Queuing Telemetry Transport*) é um protocolo de mensageria leve e eficiente, projetado para situações em que as aplicações possuem recursos computacionais limitados e a largura de banda da rede é limitada ou instável. Esse protocolo é **amplamente utilizado em aplicações de Internet das Coisas** (IoT) e **Edge Computing**, e facilita a **comunicação entre dispositivos com recursos limitados e servidores**, usando um modelo **publicar/assinar** (publisher/subscriber, ou pub/sub). Isso permite que dispositivos **publiquem mensagens em tópicos, que são então distribuídos aos clientes inscritos, garantindo que as mensagens sejam entregues mesmo em condições de rede instáveis**. Suas principais características incluem simplicidade, eficiência e baixo consumo de energia, tornando-o ideal para cenários de comunicação em tempo real em ambientes com conectividade restrita.

![MQTT - Arquitetura](/assets/images/system-design/arquitetura-simples.png)
> Arquitetura MQTT Resumida

No quesito de topologia, a arquitetura de uma implementação MQTT necessita de alguns agentes e responsabilidades. Como a **finalidade do protocolo é o envio de mensagens assíncronas vindas de diferentes tipos de dispositivos**, que serão processadas por outros tipos de aplicação no lado do servidor, o responsável por receber e orquestrar essas mensagens para seus destinatários são clusters de servidores MQTT. **Esse conjunto de servidores são conhecidos como brokers**, que trabalham como centralizadores dessas mensagens enviadas por vários dispositivos. Esses agentes **responsáveis por enviar as mensagens são conhecidos como Publishers**. Os brokers, após receberem as mensagens, as armazenam em **tópicos** identificados durante a publicação. Após o armazenamento, o cluster disponibiliza as mensagens para serem consumidas por outras aplicações que farão uso dessas informações publicadas. **Essas aplicações que consomem os dados são identificadas como Subscribers.**

### Quebrar em Componentes

![MQTT - Workflow](/assets/images/system-design/protocolos-mqtt.png)

O **MQTT opera sobre o protocolo TCP/IP**, estabelecendo uma **conexão de socket persistente entre o cliente e o broker**. O que proporciona uma comunicação bidirecional confiável, onde os pacotes de dados são garantidos a chegar na ordem e sem duplicidades.

Dentro desta conexão persistente, os clientes podem:
- **Publicar mensagens** em tópicos específicos usando a mensagem de `PUBLISH`.
- **Assinar tópicos** para receber mensagens usando a mensagem de `SUBSCRIBE`.

Dentro dessa conexão, todas as mensagens são trocadas de forma performática e confiável.

### MQTT Default Subscription

A subscrição padrão no MQTT segue o modelo de publicação/assinatura tradicional, onde cada assinante que se inscreve em um tópico recebe uma cópia da mensagem publicada nesse tópico. Isso significa que se três dispositivos estão inscritos no tópico `"sensor/temperatura"`, e uma mensagem é publicada neste tópico, cada um dos três dispositivos receberá uma cópia independente da mensagem.

![MQTT - Normal](/assets/images/system-design/mqtt-normal.png)
> Modelo de subscription padrão do MQTT

Existem várias formas de projetar arquiteturas MQTT, e este modelo padrão é extremamente útil quando é necessário que todos os assinantes recebam todas as mensagens, garantindo que a informação distribuída seja amplamente acessível para vários tipos de aplicações que precisem tomar várias ações diferentes. Por exemplo, se você precisar receber a medição do `sensor/temperatura`, armazená-la em um banco de dados, enviá-la para um processo de análise e, com base no valor recebido, tomar alguma ação em outro sistema, você pode criar três tipos de aplicações interessadas nessa mensagem e recebê-las simultaneamente.


### MQTT Shared Subscription

A **Shared Subscription**, introduzida em versões mais recentes do padrão MQTT, é uma importante adição que **permite um modelo de distribuição de mensagens mais próximo do balanceamento de carga**. Em uma subscrição compartilhada, mensagens publicadas em um tópico são distribuídas de maneira balanceada entre os assinantes do grupo de subscrição compartilhada, em vez de cada assinante receber uma cópia da mensagem.

![MQTT - Shared](/assets/images/system-design/mqtt-shared.png)
> Modelo de shared subscription do MQTT

Esse modo de subscrição é particularmente útil em cenários de **processamento de mensagens em larga escala**, onde o balanceamento de carga entre múltiplos consumidores é necessário para otimizar o processamento devido ao alto volume de entrada. Elas permitem uma **arquitetura mais escalável e eficiente**.

Enquanto a **subscrição normal garante que todas as mensagens sejam distribuídas a todos os assinantes**, a **subscrição compartilhada oferece uma abordagem mais eficiente e escalável para o balanceamento de carga entre os assinantes**. Ambos os tipos de subscrição têm seu lugar no ecossistema MQTT e oferecem flexibilidade para projetar arquiteturas. Um ponto interessante é que podemos combinar as duas possibilidades, criando várias shared subscriptions que recebem a mesma mensagem e que distribuem a carga para os membros de cada pool de subscribers.


<br>

## AMQP (Advanced Message Queuing Protocol)

O **AMQP** (*Advanced Message Queuing Protocol*) é um protocolo de mensageria aberto que, ao contrário do MQTT, que se concentra na simplicidade e eficiência, oferece um **conjunto mais rico de funcionalidades, incluindo confirmação de mensagens, roteamento flexível e transações seguras**. Ele é projetado para **integrar sistemas corporativos e aplicações complexas**, proporcionando uma solução interoperável para mensageria assíncrona. O AMQP **suporta tanto o modelo de publicação/assinatura quanto o de enfileiramento de mensagens**, oferecendo uma maior flexibilidade na implementação de padrões de comunicação. Esse padrão é implementado por **RabbitMQ**, uma solução muito conhecida para troca de mensagens de forma assíncrona.

![Arquitetura AMQP](/assets/images/system-design/amqp-arquitetura.png)

![Workflow AMQP](/assets/images/system-design/amqp.png)

Tudo começa com a criação de uma conexão TCP entre o cliente (produtor ou consumidor) e o servidor AMQP (broker). O TCP/IP serve como a base para a comunicação, estabelecendo um canal de comunicação bidirecional e confiável entre as partes. Após o estabelecimento da conexão TCP, inicia-se a negociação do protocolo AMQP. O cliente envia um protocolo header para o servidor, indicando a versão do AMQP que deseja usar. O servidor responde, confirmando a versão do protocolo ou sugerindo uma alternativa.

Uma vez acordada a versão do protocolo, estabelece-se uma **sessão AMQP**. Dentro dessa sessão, podem ser **criados vários canais de comunicação lógicos, que permitem múltiplas correntes de comunicação sobre a mesma conexão TCP**.

O produtor publica mensagens enviando-as ao broker através de um canal específico na sessão AMQP. Cada mensagem é rotulada com uma chave de roteamento ou enviada para uma exchange específica, que determina como a mensagem deve ser encaminhada às filas. O broker utiliza as informações e metadados contidos na mensagem, como a exchange e a chave de roteamento, para determinar a fila destino das mensagens. As mensagens são então encaminhadas para as filas apropriadas, aguardando pelo consumo.

### Brokers

Dentro da arquitetura do AMQP, um broker é um centralizador e intermediário entre produtores e consumidores que atua na gestão do tráfego de mensagens entre ambos. Os brokers gerenciam a recepção, tratamento, armazenamento e direcionamento das mensagens para as filas apropriadas, utilizando metadados e informações enviadas pelo produtor para realizar esse direcionamento de forma correta. Um broker agrupa tanto as exchanges, routes quanto as queues, e disponibiliza as mensagens para serem consumidas pelos consumidores. Eles trabalham mais próximos do nível físico.

### Channels

No AMQP, um **Channel é uma sessão virtual que é estabelecida tanto pelo consumidor quanto pelo produtor** através do próprio protocolo. Os Channels são persistentes e permitem que operações e mensagens sejam trafegadas simultaneamente através de uma única conexão, tornando o protocolo muito "barato" em termos computacionais. Resumidamente, cada sessão é uma conexão independente que possibilita múltiplas operações, evitando assim a necessidade de criar múltiplas conexões de rede que podem sobrecarregar os brokers e tornar a performance e gestão dessas conexões ineficientes em média/larga escala.

### Queues

Uma queue, de forma genérica, tem o mesmo conceito dentro da arquitetura do AMQP, sendo a estrutura de dados que armazena temporariamente as mensagens para que sejam processadas posteriormente pelo consumidor. Nelas, podem ser configurados parâmetros como persistência, visibilidade, durabilidade e time to live. As queues, no sentido mais amplo, são os intermediários diretos do dado produzido e consumido de forma enfileirada.

### Producers

Um producer é a entidade que **envia as mensagens para uma exchange através de canais estabelecidos no AMQP** para que as mesmas sejam direcionadas para a queue correta. A sua responsabilidade é informar a mensagem e a binding key específica para indicar para onde a mensagem será roteada dentro do conjunto de queues possíveis. Eles podem especificar como será feita a persistência e prioridade da mensagem enviada.

### Consumers

Um consumidor é a entidade que **recebe as mensagens que estavam armazenadas na queue de forma enfileirada**. Suas responsabilidades são se inscrever nas queues de interesse e receber as mensagens conforme a lógica definida nas mesmas. Eles podem operar no modo de auto-ack, onde a primeira recepção já é um indicativo para deletar a mensagem da fila, ou com confirmações manuais, onde após um processamento intenso, o consumidor especifica diretamente para a queue se a mensagem recebida pode, ou não, ser deletada ou re-enviada para consumo em caso de erros.

### Exchanges e Binding Keys

As **Exchanges são componentes dentro do broker responsáveis por receber mensagens dos produtores e, através das regras de roteamento, fazer a entrega para as queues corretas**. Existem vários tipos de exchanges, como direct, topic, fanout e headers, cada um definindo uma estratégia de roteamento diferente para a queue correta. A escolha da exchange depende do padrão de mensageria desejado entre o produtor e consumidor. As exchanges distribuem as mensagens para as queues específicas fazendo uso das **binding keys**.

### Tipos de Exchanges

Dentro do AMQP, possuímos alguns tipos de exchanges que têm finalidades e funcionamentos específicos. Nesse tópico, vamos abordar algumas das mais importantes e que, ao meu ver, são as mais úteis para projetar soluções de arquitetura:

Cada tipo de exchange oferece flexibilidade na configuração do comportamento de roteamento das mensagens e pode ser selecionado com base em requisitos específicos de distribuição e processamento. Vamos entender o funcionamento de três opções entre as conhecidas entre os tipos de exchanges.


#### Direct Exchange

Uma exchange do tipo Direct é o tipo padrão e mais comum de produção de mensagens em filas gerenciadas pelo AMQP. Ela é o modelo básico de associação de uma exchange a uma queue e utiliza a binding key para direcionar a mensagem para a queue correta. Esse tipo de roteamento caracteriza um encaminhamento ponto a ponto, onde a binding key precisa ser interpretada de maneira exata para o encaminhamento correto. Pode ser utilizada em arquiteturas que distribuem "comandos" entre sistemas de maneira imperativa, como "cobrar", "enviar", "processar", "criar", "cadastrar", etc.

Imagine uma arquitetura de e-commerce onde você precisa enviar mensagens com assinaturas e conteúdos diferentes para vários sistemas. O conteúdo dessas mensagens é específico para cada sistema e não pode ser reaproveitado. Sempre que uma compra precisar ser confirmada, utilizamos a binding key `confirmar_compra` para enviar a mensagem para a fila de confirmação de compra; similarmente, quando precisamos enviar um e-mail de forma assíncrona, usamos a binding key `enviar_email`; e quando é necessário notificar o sistema de cobrança para processar a compra, utilizamos a binding key `cobrar` para rotear a mensagem para a fila de cobrança. Este é um exemplo prático do funcionamento de uma Direct Exchange.

![Exchange Default](/assets/images/system-design/amqp-default.png)

Abaixo temos uma implementação básica de um produtor e um consumidor no padrão de Direct Exchange. Criamos uma exchange chamada `ecommerce.nova.venda`, onde simulamos o tráfego de mensagens de vendas concluídas de um suposto e-commerce. Criamos uma queue chamada `cobrar` e a associamos à exchange com uma binding key também chamada `cobrar`.

Na produção, conectamo-nos ao broker informando a exchange criada, e enviando a binding key `cobrar`, a mensagem estará disponível na queue para ser consumida.


##### Setup e Binding no Modo Direct
```go
conn, err := amqp.Dial("amqp://user:password@localhost:5672/")
if err != nil {
    fmt.Println("Falha ao conectar com o broker", err)
    return
}
defer conn.Close()

// Criando um canal
ch, err := conn.Channel()
if err != nil {
    fmt.Println("Falha ao abrir um canal com o broker", err)
    return
}
defer ch.Close()

// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda", // Nome da exchange
    "direct",               // Tipo da exchange
    true,                   // durable
    false,                  // auto-deleted
    false,                  // internal
    false,                  // no-wait
    nil,                    // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```


```go
// Criação de uma Queue
q, err := ch.QueueDeclare(
    "cobrar", // Nome da fila
    true,     // durable
    false,    // delete when unused
    false,    // exclusive
    false,    // no-wait
    nil,      // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    q.Name,                 // Nome da fila
    "cobrar",               // Binding key de roteamento
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

##### Producer no Modo Direct
```go
// ...
for i := 0; i < 10; i++ {

    id := uuid.New()

    // Mensagem simples
    body := fmt.Sprintf("id:%v", id)

    // Publicando a mensagem na exchange
    err = ch.Publish(
        "ecommerce.nova.venda", // exchange
        "cobrar",               // routing key (binding key)
        false,                  // mandatory
        false,                  // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }

    fmt.Printf("Mensagem de venda enviada para a exchangeecommerce.nova.venda: %v\n", body)
}

```


##### Consumer no Modo Direct
```go
// Criação de uma Queue // Caso já exista, simplesmente se conecta
q, err := ch.QueueDeclare(
    "cobrar", // Nome da fila
    true,     // durable
    false,    // delete when unused
    false,    // exclusive
    false,    // no-wait
    nil,      // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

msgs, err := ch.Consume(
    q.Name, // queue
    "",     // consumer
    false,  // auto-ack
    false,  // exclusive
    false,  // no-local
    false,  // no-wait
    nil,    // args
)

forever := make(chan bool)

go func() {
    for d := range msgs {
        fmt.Printf("Mensagem de cobrança recebida na queue %v: %v\n", q.Name, string(d.Body))
        d.Ack(true)
    }
}()

fmt.Println("[Cobranca de Vendas] Aguardando por mensagens")
<-forever
```

```
```

```
```


#### Topic Exchange

As Topic Exchanges oferecem roteamentos mais dinâmicos quando comparadas à correspondência exata das Direct Exchanges. Com elas, podemos fazer roteamentos entre a exchange e as queues baseados em padrões da binding key. Isso significa que podemos criar bindings baseados em caracteres curinga como `*` que substitui uma palavra e `#` que substitui zero ou mais palavras.

Vamos imaginar que dentro do nosso e-commerce, o sistema de faturamento é notificado através de mensageria. Utilizamos uma exchange e uma queue chamada `queue.faturamento` para enviar as mensagens dos pedidos a serem faturados. Porém, encontramos um cenário de [gargalo](/performance-capacidade-escalabilidade/) em alguns clientes críticos que precisam de um SLA de faturamento menor, e devido ao alto volume financeiro e criticidade, não podem concorrer com as mensagens de todos os outros clientes no sistema inteiro. Para isso, criamos uma segunda queue chamada `queue.faturamento.prioritario`, onde através da binding key informada, a mensagem é destinada para uma carga de trabalho dedicada a esses casos. Decidimos utilizar as binding keys `faturamento.prioridade.default` e `faturamento.prioridade.alta` para fazer essa diferenciação.

Além disso, todas as mensagens de faturamento, independentemente do nível de criticidade, são enviadas para um datalake de forma assíncrona, utilizando a queue `queue.faturamento.datalake`. Aqui, uma Topic Exchange pode nos ajudar, permitindo a criação de regras de binding específicas para cada nível de prioridade e também uma binding com um curinga `*` para duplicar e rotear todas as mensagens para a queue do Data Lake, no formato `faturamento.prioridade.*`.

Nesse cenário, mesmo utilizando tanto a binding key de prioridade default quanto a de prioridade alta, todas as mensagens que corresponderem ao padrão `faturamento.prioridade.*` também serão enviadas para a fila do datalake.

![Exchange - Topic 1](/assets/images/system-design/amqp-topic-1.png)

![Exchange - Topic 2](/assets/images/system-design/amqp-topic-2.png)

Vamos reproduzir exatamente esse cenário hipotético abaixo, onde criaremos três queues e três bindings, para o faturamento de prioridade default, o faturamento de prioridade alta e o envio dos faturamentos para o datalake analítico. Ao informar a prioridade requisitada na produção, a mensagem será devidamente roteada para o microserviço segregado específico, e também de forma genérica para o datalake.


##### Setup e Binding no Topic

```go
// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    "topic",                            // Tipo da exchangem - topic
    true,                               // durable
    false,                              // auto-deleted
    false,                              // internal
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```

```go
// Criação de uma Queue de faturamento de vendas
// de prioridade default, onde em teoria a maior parte das
// mensagens será enviada
queueDefault, err := ch.QueueDeclare(
    "queue.faturamento", // Nome da fila
    true,                // durable
    false,               // delete when unused
    false,               // exclusive
    false,               // no-wait
    nil,                 // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    queueDefault.Name,                  // Nome da fila
    "faturamento.prioridade.default",   // Binding key de roteamento - chave de prioridade default
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```

```go
// Criação de uma Queue de faturamento de vendas
// de prioridade alta, onde somente os clientes de maior volume
// financeiro será destinada
queuePrioridade, err := ch.QueueDeclare(
    "queue.faturamento.prioritario", // Nome da fila
    true,                            // durable
    false,                           // delete when unused
    false,                           // exclusive
    false,                           // no-wait
    nil,                             // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    queuePrioridade.Name,               // Nome da fila
    "faturamento.prioridade.alta",      // Binding key de roteamento - chave de prioridade alta
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```
    
```go
// Criação de uma Queue que receberá todas as mensagens, independente da prioridade
// A intenção é receber todos os pedidos de faturamento e enviar para um
// suposto analítico
queueLake, err := ch.QueueDeclare(
    "queue.faturamento.datalake", // Nome da fila
    true,                         // durable
    false,                        // delete when unused
    false,                        // exclusive
    false,                        // no-wait
    nil,                          // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a queue na exchange, todas as mensagems que forem enviadas com o pattern
// faturamento.prioridade.* será enviada para essa fila independente da prioridade informada
err = ch.QueueBind(
    queueLake.Name,                     // Nome da fila
    "faturamento.prioridade.*",         // Binding key de roteamento - chave de prioridade alta
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```

##### Producer no Modo Topic

```go
for i := 0; i < 3000000000; i++ {

    routingKey := "faturamento.prioridade.default"
    if rand.Float64() < 0.1 { // mock para dar 10% de chance de uma mensagem ser encaminhada para a queue prioritária
        routingKey = "faturamento.prioridade.alta"
    }

    id := uuid.New()
    // Mensagem simples
    body := fmt.Sprintf("id:%v:%v", routingKey, id)

    // Publicando a mensagem na exchange usando a routing key de default/prioritario
    err = ch.Publish(
        "ecommerce.nova.venda.faturamento", // exchange
        routingKey,                         // routing key (binding key)
        false,                              // mandatory
        false,                              // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }
    fmt.Printf("Mensagem de faturamento enviada para a queue %v: %v\n", routingKey, body)
}
```

#### Fanout Exchange

Uma Fanout Exchange é um tipo de exchange muito interessante, pois permite vincular várias queues a uma única exchange e, sem a necessidade de especificar uma binding key, replicar a mesma mensagem entre todas elas. Esse tipo de abordagem é útil quando precisamos notificar vários subsistemas simultaneamente, assemelhando-se mais a um evento, mas ainda operando dentro de um contexto de mensageria. Imagine, por exemplo, em nosso sistema de e-commerce, que precisamos notificar simultaneamente os sistemas de cobrança, logística e estoque a respeito de uma nova venda. Esses processos podem ser executados em paralelo, não requerem uma ordem específica para conclusão e podem demorar conforme necessário, e todos eles podem utilizar os dados de um mesmo payload. Este é um cenário ideal para uma Fanout Exchange, onde a partir de uma única ação de produção, a mesma mensagem é entregue de forma idêntica a todas as queues associadas.

![Exchange Fanout](/assets/images/system-design/amqp-funout.png)

##### Setup no Fanout

Para configurar uma Fanout Exchange, basta associar as queues desejadas à exchange e qualquer mensagem publicada nessa exchange será distribuída para todas as queues vinculadas. Não há necessidade de definir uma chave de roteamento, pois a Fanout Exchange ignora esse parâmetro, simplificando a configuração e maximizando a eficiência da distribuição de mensagens.

![Exchange - Fanout](/assets/images/system-design/amqp-funout.png)


```go
// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda", // Nome da exchange
    "fanout",               // Tipo da exchange
    true,                   // durable
    false,                  // auto-deleted
    false,                  // internal
    false,                  // no-wait
    nil,                    // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```

```go
// Criação de uma Queue de cobranca
qCobranca, err := ch.QueueDeclare(
    "cobrar_pedido", // Nome da fila
    true,            // durable
    false,           // delete when unused
    false,           // exclusive
    false,           // no-wait
    nil,             // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qCobranca.Name,         // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

```go
// Criação de uma Queue de cobranca
qEstoque, err := ch.QueueDeclare(
    "reservar_estoque", // Nome da fila
    true,               // durable
    false,              // delete when unused
    false,              // exclusive
    false,              // no-wait
    nil,                // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qEstoque.Name,          // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

```go
// Criação de uma Queue de cobranca
qLogistica, err := ch.QueueDeclare(
    "informar_logistica", // Nome da fila
    true,                 // durable
    false,                // delete when unused
    false,                // exclusive
    false,                // no-wait
    nil,                  // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qLogistica.Name,        // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

##### Producer no Fanout

```go
for i := 0; i < 3000000000; i++ {

    id := uuid.New()

    // Mensagem simples
    body := fmt.Sprintf("id:%v", id)

    // Publicando a mensagem na exchange
    err = ch.Publish(
        "ecommerce.nova.venda", // exchange
        "",                     // Binding key de roteamento - Ignorada no Fanout
        false,                  // mandatory
        false,                  // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }

    fmt.Printf("Mensagem de venda enviada para a exchange ecommerce.nova.venda: %v\n", body)
}
```



### Revisores

* [Tarsila, o amor da minha vida](https://twitter.com/tarsilabianca_c)
* [Klecianny Melo](https://twitter.com/kecbm)



### Referências

[MQTT](https://mqtt.org/)

[O que é MQTT?](https://aws.amazon.com/pt/what-is/mqtt/)

[Conhecendo o MQTT](https://www.mercatoautomacao.com.br/blogs/novidades/conhecendo-o-mqtt)

[Arquitetura do agente MQTT independente no Google Cloud](https://cloud.google.com/architecture/connected-devices/mqtt-broker-architecture?hl=pt-br)

[Eclipse Paho MQTT Go client](https://pkg.go.dev/github.com/eclipse/paho.mqtt.golang#section-readme)

[AMQP](https://www.amqp.org/)

[Advanced Message Queuing Protocol](https://pt.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

[AMQP — Propriedades de Mensagem](https://medium.com/xp-inc/amqp-propriedades-de-mensagem-f56a14e92409)

[FAQ: What is AMQP and why is it used in RabbitMQ?](https://www.cloudamqp.com/blog/what-is-amqp-and-why-is-it-used-in-rabbitmq.html)

[RabbitMQ Exchange Type](https://hevodata.com/learn/rabbitmq-exchange-type/)

[Enqueue and Dequeue](https://docs.oracle.com/cd/E19253-01/820-0446/chp-sched-10/index.html)

[Kafka - Architecture](https://kafka.apache.org/10/documentation/streams/architecture)

[Kafka Basics and Core Concepts](https://medium.com/inspiredbrilliance/kafka-basics-and-core-concepts-5fd7a68c3193)

[Apache Kafka: 10 essential terms and concepts explained](https://www.redhat.com/en/blog/apache-kafka-10-essential-terms-and-concepts-explained)

[Event Driven Architecture, The Hard Parts: Events Vs Messages](https://medium.com/simpplr-technology/event-driven-architecture-the-hard-parts-events-vs-messages-0fcfc7243703)

[How Much Data Does Streaming Netflix Use?](https://www.buckeyebroadband.com/support/internet/how-much-data-does-streaming-netflix-use)

[Apache Kafka – linger.ms and batch.size](https://www.geeksforgeeks.org/apache-kafka-linger-ms-and-batch-size/)