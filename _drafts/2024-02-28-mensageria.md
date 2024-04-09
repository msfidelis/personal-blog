---
layout: post
image: assets/images/system-design/async.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Padrões de Mensageria e Eventos
---

Arquiteturas assincronas derivadas do uso de mensageria e eventos são recursos muito valiosos quando arquitetamos soluções complexas de sistemas distribuídos. Assim como os dois capitulos anteriores onde falamos sobre [protocolos e padrões de rede](/protocolos-de-rede/) e [padrões de comunicação sincronos](/padroes-de-comunicacao-sincronos/) em sistemas, esse tópico também visa detalhar comunicações entre componentes de uma arquitetura de serviço, mas com uma abordagem de comunicação assincrona. Vamos detalhar e diferenciar alguns tópicos importantes como Mensagens e Eventos, e como utilizá-los para resolver problemas de comunicação em larga escala utilizando protocolos como MQTT, AMQP, comunicação assincrona Over-TCP com o Kafka, arquitetura desses componentes, assim como suas vantegens e limitações. 

# Mensagens e Eventos

## Definindo Mensageria 

Usando um

## Definindo Eventos

## Eventos vs Mensagens

# Protocolos e Arquiteturas de Eventos

# Protocolos e Arquiteturas de Mensageria

Os protocolos de mensageria desempenham papéis na facilitação da comunicação entre sistemas distribuídos, permitindo a troca eficiente de mensagens de forma assíncrona. Dois dos protocolos mais importantes nesta categoria são o **MQTT** (*Message Queuing Telemetry Transport*) e o **AMQP** (*Advanced Message Queuing Protocol*). Esses protocolos são projetados para otimizar o tráfego de dados, garantir a entrega de mensagens e suportar padrões de comunicação flexíveis, confiáveis e performáticos. Normalmente as comunicações que se utilizam do HTTP tem uma responsabilidade sincrona de solicitação e resposta, utilizado onde é necessário receber do servidor uma resposta imediata para a transação solicitada. Porém em termos de performance, os protocolos que possibilitam comunicações assincronas podem nos ajudar a extender as capacidades de processamento em background de tarefas custosas, paralelizar e distribuir tarefas entre diversos microserviços com diferentes possibilidades necessárias para completar a solicitação, continuar o trabalho de uma solicitação inicialmente sincrona em background entre diversas outras possibilidades. Aqui falaremos inicialmente de como funciona o protocolo. Breve falaremos mais detalhadamente da aplicação e implementação de tarefas assincronas em engenharia de fato. 

<br>

## MQTT (Message Queuing Telemetry Transport)

O **MQTT** (*Message Queuing Telemetry Transport*) é um protocolo de mensageria leve e eficiente, projetado para situações em que as aplicações possuem recursos computacionais limitados e a largura de banda da rede é limitada ou instável. Esse protocolo é **amplamente utilizado em aplicações de Internet das Coisas** (IoT) e **Edge Computing**, e facilita a **comunicação entre dispositivos com recursos limitados e servidores**, usando um modelo **publicar/assinar**, ou **publisher/subscriber**, ou **pub/sub**. Isso permite que dispositivos **publiquem mensagens em tópicos, que são então distribuídos aos clientes inscritos, garantindo que as mensagens sejam entregues mesmo em condições de rede instáveis**. Suas principais características incluem simplicidade, eficiência e baixo consumo de energia, tornando-o ideal para cenários de comunicação em tempo real em ambientes com conectividade restrita.

![MQTT - Arquitetura](/assets/images/system-design/arquitetura-simples.png)
> Arquitetur MQTT Resumida

No quesito de topologia, a arquitetura de uma implementação MQTT precisam de alguns agentes e responsabilidades. Como a **finalidade do protocolo é o envio de mensagens assincronas vindas de diferentes tipos de dispositivos** que serão processadas por outros tipos de aplicacão no lado do servidor, o responsável por receber e orquestrar essas mensagens para seus destinatários são clusters de servidores MQTT. **Esse conjunto de servidores são conhecidos como brokers**, que trabalham como centralizadores dessas mensagens enviadas por vários dispoitivos. Esses agentes **responsáveis por enviar as mensagens são conhecidos como Publishers**. Os brokers após receberem as mensagens, ele as armazenam em **tópicos** identificados durante a publicação. Após o armazenamento, o cluster disponibiliza as mensagens para serem consumidas por outras aplicações que vão fazer um uso para essas informações publicadas. **Essas aplicações que consomem os dados são identificadas como Subscribers.**

### Quebrar em componentes

![MQTT - Workflow](/assets/images/system-design/protocolos-mqtt.png)

O **MQTT opera sobre o protocolo TCP/IP**, estabelecendo uma **conexão de socket persistente entre o cliente e o broker**. Isso proporciona uma comunicação bidirecional confiável, onde os pacotes de dados são garantidos a chegar na ordem e sem duplicidades.

Dentro desta conexão persistente, os clientes podem publicar mensagens em tópicos específicos usando a mensagem de `PUBLISH`, e assinar tópicos para receber mensagens usando a mensagem de `SUBSCRIBE`. Dentro dessa conexão todas as mensagens são trocadas de forma performática e confiável.  

### MQTT Default Subscription 

A subscrição normal no MQTT segue o modelo de publicação/assinatura tradicional, onde cada assinante que se inscreve em um tópico recebe uma cópia da mensagem publicada nesse tópico. Isso significa que se três dispositivos estão inscritos no tópico `"sensor/temperatura"`, e uma mensagem é publicada neste tópico, cada um dos três dispositivos receberá uma cópia independente da mensagem.

![MTT - Normal](/assets/images/system-design/mqtt-normal.png)
> Modelo de subscription padrão do MQTT

Existem várias formas de projetar arquiteturas MQTT, e este modelo padrão é extremamente útil quando é necessário que todos os assinantes recebam todas as mensagens, garantindo que a informação distribuída seja amplamente acessível para vários tipos de aplicações que precisem tomar vários tipos de ações diferentes. Caso você precise por exemplo receber a medição do `sensor/temperatura`, armazená-la em um database, enviá-la para um processo de analytics e com base no valor recebido tomar alguma ação em outro sistema, você pode criar 3 tipos de aplicações interessadas nessa mensagem e recebê-las ao mesmo tempo. 


### MQTT Shared Subscription 

A **Shared Subscription**, introduzida em versões mais recentes do padrão MQTT, é uma importante adição que **permite um modelo de distribuição de mensagens mais proximo do balanceamento de carga**. Em uma subscrição compartilhada, mensagens publicadas em um tópico são distribuídas de maneira balanceada entre os assinantes do grupo de subscrição compartilhada, em vez de cada assinante receber uma cópia da mensagem. 


![MTT - Shared](/assets/images/system-design/mqtt-shared.png)
> Modelo de shared subscription do MQTT

Esse modo de subscription é particularmente úteis em cenários de **processamento de mensagens em larga escala**, onde o balanceamento de carga entre múltiplos consumidores é necessária para otimizar o processamento devido ao alto volume de entrada. Elas permitem uma **arquitetura mais escalável e eficiente**.

Enquanto a **subscrição normal garante que todas as mensagens sejam distribuídas a todos os assinantes**, a **subscrição compartilhada oferece uma abordagem mais eficiente e escalável para o balanceamento de carga entre os assinantes**. Ambos os tipos de subscrição têm seu lugar no ecossistema MQTT e abrem o leque para projetar arquiteturas. Um ponto interessante é que podemos combinar as duas possibilidades, criando várias shared subscriptions que recebem a mesma mensagem, e que distribuem a carga para os membros de cada pool de subscribers.

<br>

## AMQP (Advanced Message Queuing Protocol)

O **AMQP** (*Advanced Message Queuing Protocol*) é um protocolo de mensageria aberto, que ao contrário do MQTT, que se concentra na simplicidade e eficiência, o fornece um **conjunto mais rico de funcionalidades, incluindo confirmação de mensagens, roteamento flexível e transações seguras**. Ele é projetado para **integrar sistemas corporativos e aplicações complexas**, proporcionando uma solução interoperável para mensageria assíncrona. O AMQP **suporta tanto o modelo de publicação/assinatura quanto o de enfileiramento de mensagens**, oferecendo uma maior flexibilidade na implementação de padrões de comunicação. Esse padrão é implementado pelo **RabbitMQ**, uma solução muito conhecida para troca de mensagens de forma assincrona. 

![Arquitetura AMQP](/assets/images/system-design/amqp-arquitetura.png)

![Workflow AMQP](/assets/images/system-design/amqp.png)

Tudo começa com a criação de uma conexão TCP entre o cliente (produtor ou consumidor) e o servidor AMQP (broker). O TCP/IP serve como a base para a comunicação, estabelecendo um canal de comunicação bidirecional e confiável entre as partes. Após o estabelecimento da conexão TCP, inicia-se a negociação do protocolo AMQP. O cliente envia um protocolo header para o servidor, indicando a versão do AMQP que deseja usar. O servidor responde, confirmando a versão do protocolo ou sugerindo uma alternativa.

Uma vez acordada a versão do protocolo, estabelece-se uma **sessão AMQP**. Dentro dessa sessão, podem ser **criados vários canais de comunicação lógicos, que permitem múltiplas correntes de comunicação sobre a mesma conexão TCP**.

O produtor publica mensagens enviando-as ao broker através de um canal específico na sessão AMQP. Cada mensagem é rotulada com uma chave de roteamento ou enviada para uma exchange específica, que determina como a mensagem deve ser encaminhada às filas. O broker utiliza as informações e metadados contidas na mensagem, como a exchange e a chave de roteamento, para determinar a fila destino das mensagens. As mensagens são então encaminhadas para as filas apropriadas, aguardando pelo consumo.

### Brokers 

Dentro da arquitetura do AMQP, um broker é um centralizador de componentes intermediário entre produtores e consumidores que atua realizando a gestão do tráfego de mensagens entre ambos. Os brokers fazem a gestão da recepção, tratamento, armazenamento e direcionamento da mensagem para suas queues apropriadas, fazendo o uso de metadados e informacões enviadas pelo produtor para realizar esse direcionamento de forma correta. Um broker agrupa tanto as exchanges, routes e queues, e  disponibiliza as mensagens para serem consumidas pelos consumidores. 

### Exchanges e Binding Keys

As Exchanges são os componentes dentro do broker responsáveis por receber as mensagens dos produtores e através das regras de roteamento fazer a entrega para as queues corretas. Existem vários tipos de exchanges, como direct, topic, fanout, e headers, cada um definindo uma estratégia de roteamento diferente para a queue correta. A escolha da exchange depende do padrão de mensageria desejado entre o produtor e consumidor. As exchanges distribuem as mensagens para as queues específicas fazendo uso das **binging keys**. As 

#### Direct Exchange

#### Topic Exchange

#### Fanout Exchange

#### Headers Exchange

#### Dead Letter Exchange



### Route / Bindings

### Queues

### Producers 

### Consumers 


### Revisores

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