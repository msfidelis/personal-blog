---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Autenticação e Autorização
---

### Bearer JSON Web Tokens (JWT)

Os Bearer JSON Web Tokens, ou JWT, são tokens que representam uma série de informações que podem ser lidas e validadas entre cliente e servidor. Os JWTs são uma forma eficiente e performática de implementar capacidades de autenticação e autorização em API's Stateless. Os JWTs possuem informações autocontidas, ou seja, quando abertos, possuem todas as informações necessárias para autenticar os usuários.

Os Tokens JWT são compostos por três partes: o **Header**, que contém informações sobre o token, como o **algoritmo utilizado para a assinatura**; o **Payload**, que contém as declarações e informações abertas do usuário, além de metadados importantes para facilitar a integração com o servidor; e a **Signature**, ou assinatura, que é uma **hash gerada pelo servidor no momento da criação do token, baseada em seu conteúdo, garantindo que nenhum atributo ou informação foi alterado**. Tanto o header quanto o payload são codificados em base64 para facilitar o tráfego através de um cabeçalho HTTP, e a assinatura é criada com base nesses valores utilizando algoritmos como HMAC ou uma chave Privada RSA. Todos os campos são separados por um ponto (`.`) e enviados via header no formato:

Abaixo temos um exemplo:

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJGaWRlbGlzc2F1cm8iLCJpYXQiOjE3MTY4NTM5MDUsImV4cCI6MTc0ODM4OTkwNSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6Ik1hdGhldXMiLCJTdXJuYW1lIjoiRmlkZWxpcyIsIkVtYWlsIjoibWF0aGV1c0BmaWRlbGlzc2F1cm8uZGV2IiwiUm9sZSI6WyJNYW5hZ2VyIiwiQWRtaW4iXX0.K1i9STmcgsq4LnamxuJUrZYkXYscVTk23JnTukcScAk
```

Decodificando cada um dos campos, ou *"abrindo o JWT"*, podemos ver todas as informações que foram utilizadas para gerar o mesmo, incluindo a assinatura gerada pelo servidor. Se qualquer informação for alterada, o algoritmo usado para gerar o token não irá validar a autenticidade do mesmo.

```bash
❯ echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9" | base64 --decode
{"typ":"JWT","alg":"HS256"}
```

```bash
❯ echo "eyJpc3MiOiJGaWRlbGlzc2F1cm8iLCJpYXQiOjE3MTY4NTM5MDUsImV4cCI6MTc0ODM4OTkwNSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6Ik1hdGhldXMiLCJTdXJuYW1lIjoiRmlkZWxpcyIsIkVtYWlsIjoibWF0aGV1c0BmaWRlbGlzc2F1cm8uZGV2IiwiUm9sZSI6WyJNYW5hZ2VyIiwiQWRtaW4iXX0" | base64 --decode
{"iss":"Fidelissauro","iat":1716853905,"exp":1748389905,"aud":"www.example.com","sub":"jrocket@example.com","GivenName":"Matheus","Surname":"Fidelis","Email":"matheus@fidelissauro.dev","Role":["Manager","Admin"]}
```

```bash
❯ echo "K1i9STmcgsq4LnamxuJUrZYkXYscVTk23JnTukcScAk" | base64 --decode
+X�I9��ʸ.v���T��$]�U96ܙӺ

```

É importante ressaltar que todas as informações utilizadas para compor o JWT podem ser facilmente abertas ao decodificar o base64, então é altamente não recomendado utilizar dados sensíveis para gerar os mesmos.

### OAuth 2.0 & OpenID Connect

### Basic Auth

### Certificados de Cliente e mTLS

### SAML (Security Assertation Markup Language)

### API Keys Customizadas