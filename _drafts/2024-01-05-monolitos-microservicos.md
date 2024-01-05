---
layout: post
image: assets/images/system-design/logo-ms-monolito.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Microserviços, Monolitos e Sistemas Distribuídos
---

Esse é o quarto artigo da série de System Design, e estou muito feliz com o rumo que esse material está tomando, e analisando onde quero chegar com a estruturação desses textos, esse deveria ter sido o primeiro de todos. 

Este artigo busca explorar as definições, vantagens e desafios das arquiteturas de monólitos e microserviços, proporcionando uma compreensão simples de como projetar sistemas para demandas modernas. O objetivo é fornecer uma análise detalhada que não apenas destaque as diferenças entre monólitos e microserviços, mas também explore como os sistemas distribuídos, os domínios de negócios e a Lei de Conway influenciam as decisões arquitetônicas dos times de engenharia. 

Talvez esse seja o artigo mais importante se no final esses textos forem tomar uma ordem lógica, pois nos proximos capítulos vamos usar ele de base e reaproveitar muitos conceitos apresentados aqui. 

<br>

# Arquitetura Monolítica

![Monolitos](/assets/images/system-design/monolito.png)

Imagine um **robozinho de controle remoto**. Esse robô, tirado da caixa, é um monolito. Ele pode ser feito em várias partes, porém todas elas estão juntas e são interligadas, representando a totalidade do brinquedo, de fato que se qualquer parte desse robozinho quebrar, o **brinquedo inteiro para de funcionar**. Essa é uma alusão de um sistema monolitico. 

Um monólito em termos de arquitetura de software refere-se a **uma aplicação onde todos os componentes e serviços estão interligados e interdependentes**, formando uma unidade única e indivisível de software. Isso significa na prática em que **todas as funcionalidades de um sistema estão presentes na mesma base de código, mesmo binário, mesma aplicação e compatilham da mesma base de dados** na sua grande maioria. 

Essa abordagem, tradicionalmente, favorece a simplicidade de desenvolvimento e implantação, pois tudo está fortemente integrado, além de ser simples manter consistência de dados, que é um dos maiores desafios de sistemas modernos. 

### Vantagens de uma arquitetura monolitica


### Desvantagens de uma arquitetura monolitica



![Monolito](/assets/images/system-design/app-monolito.png)

<br>

# Arquitetura Microserviços

Agora pense numa **grande caixa de LEGO**. Cada bloco de LEGO é uma **parte pequena e separada**. Você pode construir muitas coisas diferentes, como uma casa, um carro, ou um avião, usando blocos diferentes. Se um bloco quebrar ou se você quiser mudar algo, é fácil! Você só troca o bloco que precisa sem mexer nos outros. Podemos imaginar agora como funcionam microserviços de forma lúdica. 

Microserviços são um estilo de arquitetura de software onde uma **aplicação é dividida em um conjunto de pequenos serviços**, cada um operando **de forma independente**. Cada microserviço é **focado em uma única função ou recurso de negócios e pode ser desenvolvido**, implantado e **escalado independentemente**.

As adoções de arquiteturas desse tipo normalmente são decorrentes de problemas de escalabilidade e manutenção, onde a necessidade de chamadas hetegêneas começa a fazer sentido para lidar com escala e demanda, ou quando precisamos trabalhar com processamentos assincronos, diminuir acoplamento de sistemas criticos, de alto volume e diminuir pontos unicos de falha. 

Imagine um cenário onde sua aplicação monolitica possui funcionalidades diferentes, que tem pesos de processamento diferentes, onde uma chamada para cadastrar um cliente que consome normalmente 200ms e pouquissimo recurso do servidor e banco de dados precisa compartilhar recursos computacionais com uma chamada de fechamento de caixa, relatórios, batches que fazem uso intensivo de CPU, Memória e I/O do banco de dados, que acabariam comprometendo a performance e experiência das outros recursos. Esse caso, poderia gerar uma discussão saudável sobre a viabilidade de quebrar essas funcionalidades em serviços diferentes. 

É comum a construção de microserviços quando temos um aumento significativo na quantidade de equipes, produtos e profissionais, onde faz sentido gerenciar o ciclo de vida das aplicações de forma mais isolada e intimista dentro de determinados contextos. Iremos abordar um pouco mais desse tópico quando entrarmos na discussão da Lei de Conway. 

![Ms](/assets/images/system-design/ms.png)

![Microserviços](/assets/images/system-design/app-ms.png)


### Vantagens de uma arquitetura de microserviços


### Desvantagens de uma arquitetura de microserviços

# Sistemas Distribuídos 

# Domínios e Design

# Lei de Cownway na arquitetura de sistemas

#### Obrigado aos Revisores

#### Referências 

[AWS - Qual é a diferença entre arquitetura monolítica e de microsserviços?](https://aws.amazon.com/pt/compare/the-difference-between-monolithic-and-microservices-architecture/)

[Microsserviços x arquitetura monolítica: entenda a diferença](https://viceri.com.br/insights/microsservicos-x-arquitetura-monolitica-entenda-a-diferenca/)

[Pattern: Monolithic Architecture](https://microservices.io/patterns/monolithic.html)

