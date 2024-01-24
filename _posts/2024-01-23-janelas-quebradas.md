---
layout: post
image: assets/images/janelas-quebradas.png
author: matheus
featured: false
published: true
categories: [ opiniao, livres ]
title: Teoria das Janelas Quebradas e a Engenharia de Software
---

> Este artigo é um exercício de um curso de escrita que eu estou fazendo. O objetivo era produzir um artigo abstrato e de opinião. Inicialmente ele não seria publicado, mas achei o resultado divertido. Não levem tão a sério.

<br>

# Teoria das Janelas Quebradas

A Teoria das Janelas Quebradas, um conceito de criminologia, foi desenvolvida pelo cientista político James Q. Wilson e pelo psicólogo criminologista George L. Kelling em 1982. Publicada no livro “***Fixing Broken Windows: Restoring Order and Reducing Crime in Our Communities***” e em várias revistas especializadas, essa teoria sugere que ambientes visivelmente desordenados e negligenciados, como um edifício com janelas quebradas, promovem gradualmente o crime e a desordem anti-social em seus arredores. A ideia central é que, se um problema como uma janela quebrada não é reparado, as pessoas vão concluir que ninguém se importa e que não há consequências para a desordem e a degradação daquele local. Isso pode levar a um aumento da criminalidade, degradações, poluições e vandalismo, pois a aparência de negligência sinaliza que a área é desregulada e insegura.

O experimento frequentemente associado à ilustração da Teoria das Janelas Quebradas, na verdade, foi conduzido pelo psicólogo de Stanford chamado Philip Zimbardo em 1969. Este experimento não foi realizado para desenvolver a teoria, mas é frequentemente citado como uma demonstração prática de seus princípios. No experimento de Zimbardo, dois carros idênticos foram abandonados em dois bairros distintos: um em uma área rica e tranquila de Palo Alto, Califórnia, e o outro no Bronx, um bairro pobre e conflituoso de Nova York. O carro no Bronx foi vandalizado quase imediatamente após ser abandonado. Já o carro em Palo Alto permaneceu intacto por uma semana, até que Zimbardo quebrou uma de suas janelas com um martelo. Após isso, ele também foi rapidamente vandalizado e destruído, mesmo estando em um bairro considerado mais rico e “nobre”. O experimento demonstrou que o processo de vandalismo não é iniciado devido à pobreza do local, mas tem relação com a psicologia humana e as relações sociais.

O experimento de Zimbardo evidenciou que, uma vez que uma norma é quebrada (neste caso, a presença de um carro com uma janela quebrada indicando descuido e abandono), as pessoas são mais propensas a desrespeitar outras normas, levando a mais vandalismo e degradação. Isso ressoa com os princípios da Teoria das Janelas Quebradas, sugerindo que sinais visíveis de desordem e descuido podem levar a um aumento da criminalidade, vandalismo, abandono e desrespeito geral, negligenciando o bem comum e a sociedade ao redor.

<br>

# Teoria das Janelas Quebradas no Desenvolvimento de Software

Existe uma padaria muito bem conceituada no centro da minha cidade, tradicional pra todos daqui, bem próxima de onde moro atualmente. Essa padaria é uma referência na cidade pela qualidade e preparo dos seus itens de vitrine, e eu a frequento quase diariamente. Do lado oposto da rua, havia um lava rápido que foi fechado. Pouco tempo depois, toda a construção passou por um processo de demolição que não foi concluído, deixando pouco de suas estruturas com acesso livre à calçada, passando uma impressão de abandono. Mesmo tendo uma lixeira pública em frente ao edifício, existe um acúmulo desproporcional de lixo no local, que antes não sofria com esse problema. Algumas pessoas passam pela lixeira, mas, devido ao acúmulo constante de sacolas ao redor dela, muitas não se dão ao trabalho de abri-la para descartar papel, plástico ou alimento, deixando-os na pilha de lixo que cresce ao longo do dia. Você consegue traçar algum paralelo desse exemplo com times e projetos de software pelos quais já passou?

Obviamente não vou falar sobre criminologia e nem dar uma opinião sobre esse experimento de uma ciência da qual não sou versado, mas me veio à mente a quantidade de vezes que vi esse padrão acontecer em meus anos trabalhando ativamente com times de engenharia. Mas o que seriam as “Janelas Quebradas” no contexto de desenvolvimento de software? Antes de mais nada, quero deixar claro que esse não é um conceito academicamente firmado, debatido, revisado e estressado entre pares e especialistas. Então, fora de um contexto muito específico de pessoas reflexivas, esse assunto nem sequer existe. Escrever um texto filosófico sem maiores estudos e referências científicas, como um total artigo de opinião, me faz querer convidar você a parar a leitura deste texto por 3 minutos e tentar responder onde se encaixariam as “janelas quebradas” em projetos que você vivenciou?

Tenho a sensação de que essa relação é direta. Não é incomum encontrar em empresas algumas bases de código degradadas por cenários que se baseiam em uma falta de cuidado que gerou ainda mais falta de cuidado como consequência. Por exemplo, projetos que não possuem uma cultura sólida de code review e testes, ou que não mantêm um acordo de praticas e styleguides, acabam tendo cada vez menos testes, documentação escassa, excesso de código duplicado, arquivos de código quase ou totalmente comentados e esquecidos. Em médio e longo prazo, essas mesmas bases de código acabam perdendo muito conhecimento, com regras de negócio confusas e responsabilidades mal definidas, o que gera invariavelmente uma queda de moral e motivação dos engenheiros diretamente responsáveis por elas. E o contato desses engenheiros com outros projetos acaba passando a diante essa cultura inconsciente de dar um “jeitinho”, pregando processos alternativos, desrespeito às regras e afetando outros projetos, bases de código, e também outros engenheiros como consequência, que por sua vez podem passar esse ciclo a diante. 

A ausência de padrões claros e processos consistentes em um time de tecnologia pode ser vista como várias "janelas quebradas". Isso pode resultar em desenvolvimento inconsistente, conflitos de integração, dificuldade de elaborar testes e problemas gigantes na colaboração e na comunicação. Assim como a reparação de janelas quebradas pode prevenir a degradação de uma rua ou um bairro, a refatoração e a manutenção de um código ou um processo de revisão de arquitetura podem prevenir a deterioração desses sistemas. 

Se pequenos erros ou práticas inadequadas são tolerados em um projeto, isso pode sinalizar que a qualidade não é uma prioridade para o ambiente em questão. Isso pode levar os engenheiros a terem menos cuidado com as soluções de forma quase inconsciente, ou frequentemente realizarem contornos, “gambiarras” e processos sem muita supervisão, que acabam deteriorando ainda mais aquele ecossistema. Assim como o descuido em um ambiente físico pode levar a mais descuido, o código ruim ou desorganizado  junto a soluções ruins não revisitadas podem levar a uma deterioração mais rápida de sistemas, tornando-o mais difícil de manter e evoluir. os mesmos  Se a equipe vê que problemas conhecidos não são abordados e priorizados, isso pode diminuir o senso de responsabilidade e o compromisso com o projeto.  A presença de "janelas quebradas" pode afetar invariavelmente a moral e a cultura da equipe.

Essa analogia também pode ser encontrada em processos e governança corporativa que permeiam direta ou indiretamente o ciclo de vida de software . Por exemplo, pipelines de entrega com muitas brechas para quebra de seus steps acabam sendo altamente degradados com o tempo. O excesso de intervenções manuais em processos automatizados muitas vezes inviabiliza o próprio processo, que, justificado por criticidades, incidentes, hotfixes urgentes, acaba abrindo precedentes para a mesma intervenção em situações menos críticas. Olhando para fluxos de infraestrutura como código, esses cenários acabam refletindo em drifts, inconsistências e inviabilizando totalmente o processo em muitos casos. Projetos que utilizam muitas “soluções alternativas” das sugeridas organizacionalmente tendem a passar por esse mesmo tipo de cenário, mesmo que nos seus primeiros momentos gerem a sensação do contrário. 

A Teoria das Janelas Quebradas quando observada pela ótica da Engenharia e Arquitetura de Software tem o potencial de nos mostrar que a tolerância ao "suficientemente bom" pode ser a porta de entrada para a degradação não apenas de um projeto específico, mas de toda a cultura de engenharia de uma organização. Portanto, assim como a reparação de uma janela quebrada em um bairro pode prevenir a degradação geral do ambiente, a atenção contínua aos detalhes e a manutenção da integridade em nossos projetos de software podem garantir não apenas a saúde técnica, mas também a vitalidade e a sustentabilidade da nossa cultura de engenharia. Que estejamos sempre atentos às pequenas rachaduras, pois nelas reside o potencial para grandes rupturas.

Em resumo, pequenas negligências, se não forem abordadas, podem escalar para problemas maiores, afetando não apenas a qualidade técnica dos projetos, mas também o moral e a motivação das equipes. É de extrema importância que times, projetos e organizações criem e mantenham uma cultura que não apenas identifique rapidamente essas "janelas quebradas", mas que também as repare de forma rápida direto na causa raiz. Isso significa adotar práticas como revisões de código rigorosas, testes automatizados, documentação apropriada e adesão a padrões, mesmo que como trade-offs perca-se uma parcela dessa “falsa impressão de agilidade” que se cria ao burlar regras . Mais do que isso, é essencial fomentar um ambiente onde a responsabilidade coletiva sobre o trabalho bem feito, ou a falta dele, sejam constantemente avaliados e revisitados. 

Revisitar esse conceito me fez refletir sobre meus anos de carreira em tecnologia e traçar analogias com diversos projetos nos quais já participei. Se você fez o exercício que sugeri, no começo do texto, acredito que estamos em pé de igualdade em termos de compreensão a partir daqui. 

<br>

### Referências

[Broken Windows](https://www.theatlantic.com/ideastour/archive/windows.html?ref=blog.codinghorror.com)

[The Broken Window Theory](https://blog.codinghorror.com/the-broken-window-theory/)

[JusBrasil: **Janelas quebradas: uma teoria do crime que merece reflexão](https://www.jusbrasil.com.br/artigos/janelas-quebradas-uma-teoria-do-crime-que-merece-reflexao/146770896)

[Broken Windows Theory in Software Development: Why Details Matter](https://hackernoon.com/broken-windows-theory-in-software-development-why-details-matter)

