---
layout: post
image: assets/images/system-design/resiliencia-cover.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Single Point of Failure
---


Em sistemas ditribuidos, a confiabilidade é um dos temas de maior importância na construção de serviços. Existem infinitas possibilidades que podem acarretar em alta disponibilidade ou problemas de disponibilidade de um sistema, e uma das formas de identificar oportunidades de otimização de [resiliência](), além de [encontrar gargalos](), é identificar os Pontos Unicos de Falha entre os componentes. Nesse rápido capítulo, vamos explorar de forma simples esse conceito e treinar o olhar crítico para identificar possíveis riscos e oportunidades.


# Definindo um Single Point of Failure

Um Single Point of Failure, SPoF, ou "Ponto Único de Falha", é um termo usado para se referir a qualquer componente, serviço ou recurso centralizado cuja a falha provoca a indisponibilidade total ou parcial de um ou mais sistemas. Um Ponto Único de Falha pode representar um [Banco de Dados](), um [Balanceador de Carga](), um [API Gateway](), um broker de mensageria ou até mesmo outro microserviço que em caso de queda, não exista nenhum caminho alternativo para que as requisições sejam estabelecidas. 


São raros os sistemas que não possuam nenhum tipo de Pontos Únicos de Falha, a partir disso podemos assumir algumas premissas, como a que quando um SPoF falha, o sistema pode entrar em modo degradado no melhor dos casos, ou parar completamente no pior. Logo, quanto maior a responsabilidade de um componente, maior o impacto de sua falha caso não existam [Fluxos de Fallback](). Outra característica importante é que recuperações manuais ou rebuilds desses componentes levam tempo e podem causar perdas significativas. 

# Contornando os Pontos de Falha

Existem estratégias comuns que podem nos auxiliar corrigir e principalmente evitar a criação de SPoF's, nesta sessão iremos identificar de forma macro como endereçar algumas delas.



### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)