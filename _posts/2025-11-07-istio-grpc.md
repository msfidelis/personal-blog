---
layout: post
image: assets/images/istio-warm-up-capa.png
author: matheus
featured: false
published: true
categories: [istio, kubernetes, load-balancing, grpc]
title: Blueprint - Istio e gRPC
---

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: recommendations-grpc
  name: recommendations-grpc
  namespace: nutrition
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recommendations-grpc
  template:
    metadata:
      labels:
        app: recommendations-grpc
        name: recommendations-grpc
        version: v1
    spec:
      serviceAccount: recommendations-grpc
      containers:
      - image: fidelissauro/recommendations-grpc-service:latest
        name: recommendations-grpc
        env:
        # ... 
        ports:
        - containerPort: 30000
          name: grpc   
      terminationGracePeriodSeconds: 60
```


```yml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: recommendations-grpc
  namespace: nutrition
spec:
  hosts:
  - "recommendations-grpc.nutrition.svc.cluster.local"
  http:
  - route:
    - destination:
        host: recommendations-grpc
        port:
          number: 30000
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: cancelled,deadline-exceeded,unavailable,internal
```


```yml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: recommendations-grpc
  namespace: nutrition
spec:
  host: recommendations-grpc.nutrition.svc.cluster.local
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL  
    loadBalancer:
      simple: ROUND_ROBIN
    connectionPool:
      tcp:
        maxConnections: 1
        connectTimeout: 1s
        # tcpKeepalive:
        #   time: 10s
        #   interval: 75s
        #   probes: 9
      http:
        http1MaxPendingRequests: 1
        http2MaxRequests: 1
        maxRequestsPerConnection: 1
        h2UpgradePolicy: UPGRADE
    # outlierDetection:
    #   consecutive5xxErrors: 5
    #   interval: 30s
    #   baseEjectionTime: 30s
    #   maxEjectionPercent: 50
    #   minHealthPercent: 50
```