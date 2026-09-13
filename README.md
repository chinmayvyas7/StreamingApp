# StreamingApp

> A containerized MERN microservice platform for video streaming,
> catalogue management, administration, authentication, and real-time
> chat, orchestrated with Kubernetes and packaged with Helm.

## Table of Contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Microservices](#microservices)
-   [Prerequisites](#prerequisites)
-   [Environment Configuration](#environment-configuration)
-   [Running with Docker Compose](#running-with-docker-compose)
-   [Building Docker Images](#building-docker-images)
-   [Docker Hub Images](#docker-hub-images)
-   [Kubernetes Deployment](#kubernetes-deployment)
-   [Helm Chart](#helm-chart)
-   [Configuration and Secrets](#configuration-and-secrets)
-   [Ingress Routing](#ingress-routing)
-   [Scaling](#scaling)
-   [Rolling Updates](#rolling-updates)
-   [Self-Healing](#self-healing)
-   [Jenkins CI Pipeline](#jenkins-ci-pipeline)
-   [Application Verification](#application-verification)
-   [Troubleshooting](#troubleshooting)
-   [Production Improvements](#production-improvements)
-   [Assignment Deliverables](#assignment-deliverables)
-   [License](#license)

------------------------------------------------------------------------

## Overview

StreamingApp is a MERN-based video streaming platform implemented as a
set of independently deployable services.

The application separates authentication, video catalogue/streaming,
administration, and chat into individual backend services. A React
frontend is served through Nginx, while MongoDB provides shared
persistent application data.

The project has been containerized and deployed to Kubernetes using a
Helm chart. Kubernetes Services provide stable internal networking,
Deployments manage application replicas and rolling updates, MongoDB
runs as a StatefulSet with persistent storage, and an NGINX Ingress
exposes the application through a single external host.

### Key capabilities

-   User registration and authentication
-   JWT-based authorization
-   Role-aware administration
-   Video catalogue management
-   S3-backed media storage and uploads
-   Dedicated administrative asset management
-   REST and WebSocket/Socket.IO chat service
-   React SPA frontend served through Nginx
-   Kubernetes orchestration
-   Helm-based configuration
-   Horizontal replica scaling
-   Rolling updates
-   Kubernetes self-healing
-   Jenkins-based CI verification

------------------------------------------------------------------------

## Architecture

``` text
                         +----------------------+
                         |      Web Browser      |
                         +----------+-----------+
                                    |
                                    | HTTP
                                    v
                         +----------------------+
                         |    NGINX Ingress     |
                         |       localhost      |
                         +----------+-----------+
                                    |
              +---------------------+----------------------+
              |            |             |          |       |
              v            v             v          v       v
        +-----------+ +-----------+ +-----------+ +------+ +-----------+
        | Frontend  | |   Auth    | | Streaming | |Admin | |   Chat    |
        |   Nginx   | | Service   | |  Service  | | Svc  | | Service   |
        |    :80    | |   :3001   | |   :3002   | |:3003 | |   :3004   |
        +-----------+ +-----------+ +-----------+ +------+ +-----------+
                            |             |          |          |
                            +-------------+----------+----------+
                                          |
                                          v
                                  +---------------+
                                  |    MongoDB     |
                                  |    :27017      |
                                  | StatefulSet/PVC|
                                  +---------------+
                                          |
                                          v
                                  +---------------+
                                  |   Amazon S3    |
                                  | Media Storage  |
                                  +---------------+
```

### Request flow

1.  The browser connects to the NGINX Ingress endpoint.
2.  The Ingress controller routes requests according to their URL path.
3.  The frontend is served by the frontend Nginx container.
4.  Authentication requests are routed to `authService`.
5.  Streaming/catalogue requests are routed to `streamingService`.
6.  Administrative requests are routed to `adminService`.
7.  Chat requests are routed to `chatService`.
8.  Backend services communicate with MongoDB through the Kubernetes
    Service `mongo`.
9.  Video and thumbnail assets are stored in Amazon S3.

------------------------------------------------------------------------

## Technology Stack

  Layer                          Technology
  ------------------------------ ---------------------------
  Frontend                       React
  Frontend Web Server            Nginx
  Backend                        Node.js
  API Framework                  Express
  Database                       MongoDB
  Authentication                 JWT
  Object Storage                 Amazon S3
  Real-Time Communication        Socket.IO / WebSocket
  Containerization               Docker
  Container Registry             Docker Hub
  Orchestration                  Kubernetes
  Package Management             Helm
  Ingress                        NGINX Ingress Controller
  CI                             Jenkins
  Local Kubernetes Environment   Docker Desktop Kubernetes

------------------------------------------------------------------------

## Project Structure

``` text
StreamingApp/
├── backend/
│   ├── adminService/
│   ├── authService/
│   ├── chatService/
│   ├── streamingService/
│   └── common/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── streamingapp/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── .helmignore
│   └── templates/
│       ├── auth-deployment.yaml
│       ├── auth-service.yaml
│       ├── streaming-deployment.yaml
│       ├── streaming-service.yaml
│       ├── admin-deployment.yaml
│       ├── admin-service.yaml
│       ├── chat-deployment.yaml
│       ├── chat-service.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       ├── mongo-statefulset.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       └── ingress.yaml
├── docker-compose.yml
├── Jenkinsfile
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

------------------------------------------------------------------------

## Microservices

  ------------------------------------------------------------------------
  Service                                       Port Responsibility
  --------------------- ---------------------------- ---------------------
  `authService`                                 3001 Registration, login,
                                                     JWT issuance,
                                                     authentication

  `streamingService`                            3002 Video catalogue,
                                                     streaming endpoints,
                                                     S3-backed media
                                                     access

  `adminService`                                3003 Video administration,
                                                     uploads, metadata,
                                                     featured content

  `chatService`                                 3004 REST and
                                                     WebSocket/Socket.IO
                                                     chat

  `frontend`                                      80 React single-page
                                                     application served
                                                     through Nginx

  `mongo`                                      27017 Shared MongoDB
                                                     database
  ------------------------------------------------------------------------

All backend services use shared application models/utilities under
`backend/common`.

------------------------------------------------------------------------

# Prerequisites

Install/configure:

-   Docker Desktop / Docker Engine
-   Docker Hub account
-   Kubernetes
-   `kubectl`
-   Helm
-   NGINX Ingress Controller
-   Git
-   Node.js and npm for local development
-   AWS account and S3 bucket for S3-backed uploads

Verify:

``` bash
docker --version
kubectl version --client
helm version
git --version
kubectl get nodes
```

For the local deployment, the Kubernetes context should be:

``` bash
kubectl config current-context
```

Expected:

``` text
docker-desktop
```

------------------------------------------------------------------------

# Environment Configuration

The application uses environment variables for database connectivity,
authentication, AWS configuration, and frontend API endpoints.

**Never commit real AWS credentials, JWT secrets, or other credentials
to Git.**

## Auth Service

``` ini
PORT=3001
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
```

## Streaming Service

``` ini
PORT=3002
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
AWS_CDN_URL=
STREAMING_PUBLIC_URL=http://localhost:3002
```

## Admin Service

``` ini
PORT=3003
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
```

## Chat Service

``` ini
PORT=3004
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
```

## Frontend build variables

``` ini
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_STREAMING_API_URL=http://localhost:3002/api
REACT_APP_STREAMING_PUBLIC_URL=http://localhost:3002
REACT_APP_ADMIN_API_URL=http://localhost:3003/api/admin
REACT_APP_CHAT_API_URL=http://localhost:3004/api/chat
REACT_APP_CHAT_SOCKET_URL=http://localhost:3004
```

For Kubernetes, external application traffic is routed through the NGINX
Ingress endpoint.

------------------------------------------------------------------------

# Running with Docker Compose

Docker Compose can be used for local development.

From the project root:

``` bash
docker compose up --build
```

The Compose stack includes:

-   MongoDB
-   authService
-   streamingService
-   adminService
-   chatService
-   frontend

The frontend is available at:

``` text
http://localhost:3000
```

Stop the stack:

``` bash
docker compose down
```

Remove the Compose volumes as well:

``` bash
docker compose down -v
```

> Removing the volume deletes local MongoDB data.

------------------------------------------------------------------------

# Building Docker Images

The project contains Dockerfiles for all five application services.

## Auth

``` bash
docker build -t chinmayvyas7/streaming-auth:1.0.0 backend/authService
```

## Streaming

``` bash
docker build -t chinmayvyas7/streaming-stream:1.0.0   -f backend/streamingService/Dockerfile backend
```

## Admin

``` bash
docker build -t chinmayvyas7/streaming-admin:1.0.0   -f backend/adminService/Dockerfile backend
```

## Chat

``` bash
docker build -t chinmayvyas7/streaming-chat:1.0.0   -f backend/chatService/Dockerfile backend
```

## Frontend

``` bash
docker build -t chinmayvyas7/streaming-frontend:1.0.0 frontend
```

List images:

``` bash
docker images
```

------------------------------------------------------------------------

# Docker Hub Images

The Docker Hub account used for the project is:

``` text
chinmayvyas7
```

Repositories:

-   `chinmayvyas7/streaming-auth`
-   `chinmayvyas7/streaming-stream`
-   `chinmayvyas7/streaming-admin`
-   `chinmayvyas7/streaming-chat`
-   `chinmayvyas7/streaming-frontend`

Images are versioned using `1.0.x` tags.

Push example:

``` bash
docker push chinmayvyas7/streaming-auth:1.0.0
docker push chinmayvyas7/streaming-stream:1.0.0
docker push chinmayvyas7/streaming-admin:1.0.0
docker push chinmayvyas7/streaming-chat:1.0.0
docker push chinmayvyas7/streaming-frontend:1.0.0
```

The frontend was subsequently versioned through later `1.0.x` tags
during deployment fixes.

------------------------------------------------------------------------

# Kubernetes Deployment

The Kubernetes configuration uses:

-   Deployments for stateless services
-   ClusterIP Services for internal networking
-   ConfigMap for non-secret configuration
-   Kubernetes Secret for sensitive configuration
-   StatefulSet for MongoDB
-   PersistentVolumeClaim for MongoDB storage
-   Readiness and liveness probes
-   NGINX Ingress for external access

## Verify the cluster

``` bash
kubectl config current-context
kubectl get nodes
```

------------------------------------------------------------------------

# Helm Chart

The Kubernetes resources are packaged as:

``` text
streamingapp/
```

Validate the chart:

``` bash
helm lint ./streamingapp
```

Render the manifests:

``` bash
helm template streamingapp ./streamingapp
```

A successful lint should report:

``` text
1 chart(s) linted, 0 chart(s) failed
```

------------------------------------------------------------------------

# Configuration and Secrets

Deployment values are stored in:

``` text
streamingapp/values.yaml
```

Sensitive local overrides should be stored separately, for example:

``` text
streamingapp/secrets.local.yaml
```

Example:

``` yaml
secrets:
  awsAccessKeyId: "<your-access-key>"
  awsSecretAccessKey: "<your-secret-key>"
  awsS3Bucket: "<your-bucket-name>"
```

The local secrets file must remain excluded from Git.

Install with local secrets:

``` bash
helm install streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml
```

Upgrade:

``` bash
helm upgrade streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml
```

**Never commit `secrets.local.yaml`, AWS access keys, AWS secret keys,
or production JWT secrets to the public repository.**

------------------------------------------------------------------------

# Verify Kubernetes Resources

After installation:

``` bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

Combined:

``` bash
kubectl get pods,svc,ingress
```

The verified deployment uses:

  Component              Replicas
  ----------- -------------------
  Admin                         2
  Auth                          2
  Chat                          2
  Frontend                      2
  Streaming                     4
  MongoDB       1 StatefulSet pod

Replica counts can be changed through Helm or Kubernetes.

------------------------------------------------------------------------

# Ingress Routing

The NGINX Ingress exposes the application through:

``` text
http://localhost
```

The deployed routing is:

  ---------------------------------------------------------------------------
  Path               Service                            Port Purpose
  ------------------ ----------------- --------------------- ----------------
  `/`                `frontend-svc`                       80 React SPA

  `/api`             `auth-svc`                         3001 Authentication
                                                             APIs

  `/api/streaming`   `streaming-svc`                    3002 Catalogue and
                                                             streaming APIs

  `/api/admin`       `admin-svc`                        3003 Administration
                                                             APIs

  `/api/chat`        `chat-svc`                         3004 Chat
                                                             REST/WebSocket
                                                             service
  ---------------------------------------------------------------------------

Check:

``` bash
kubectl get ingress
```

The application is accessed through:

``` text
http://localhost
```

------------------------------------------------------------------------

# Scaling

Scale the streaming Deployment to four replicas:

``` bash
kubectl scale deployment/streaming --replicas=4
```

Verify:

``` bash
kubectl get deployment streaming
kubectl get pods -l app=streaming
```

Expected Deployment state:

``` text
NAME        READY   UP-TO-DATE   AVAILABLE
streaming   4/4     4            4
```

Helm can also control replicas:

``` bash
helm upgrade streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml   --set services.streaming.replicas=4
```

------------------------------------------------------------------------

# Rolling Updates

Application Deployments use Kubernetes `RollingUpdate`.

Configured strategy:

``` yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

This maintains availability while a new version is rolled out.

Example:

``` bash
helm upgrade streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml   --set services.frontend.tag=1.0.2
```

Check the rollout:

``` bash
kubectl rollout status deployment/frontend
```

View rollout history:

``` bash
kubectl rollout history deployment/frontend
```

Rollback if required:

``` bash
kubectl rollout undo deployment/frontend
```

------------------------------------------------------------------------

# Self-Healing

Kubernetes automatically replaces pods managed by Deployments when they
are deleted or fail.

Find a streaming pod:

``` bash
kubectl get pods -l app=streaming
```

Delete one:

``` bash
kubectl delete pod <streaming-pod-name>
```

Watch the replacement:

``` bash
kubectl get pods -l app=streaming -w
```

The Deployment automatically creates a replacement pod that eventually
reaches:

``` text
1/1 Running
```

This demonstrates Kubernetes self-healing.

------------------------------------------------------------------------

# Jenkins CI Pipeline

The repository contains a root-level:

``` text
Jenkinsfile
```

The Jenkins job is configured to use:

``` text
https://github.com/chinmayvyas7/StreamingApp.git
```

and:

``` text
*/main
```

with:

``` text
Script Path: Jenkinsfile
```

The CI pipeline performs:

1.  Source checkout
2.  Project/tool verification
3.  Docker image build
4.  Helm chart linting
5.  Helm manifest rendering
6.  Success/failure reporting

The Jenkins pipeline was successfully executed against the project
repository.

### CI and local Kubernetes separation

The Jenkins server runs on a remote Linux agent. The Kubernetes cluster
used for application deployment and smoke verification runs locally
through Docker Desktop.

Therefore:

-   Jenkins validates/builds the project.
-   Docker Desktop Kubernetes hosts the demonstrated local deployment.
-   The Jenkins job does not directly control the local Docker Desktop
    cluster.

------------------------------------------------------------------------

# Application Verification

## Authentication

The authentication service supports:

-   Registration
-   Login
-   JWT issuance
-   Role-aware authorization

## Administration

The admin service supports:

-   Admin-only access
-   Video catalogue management
-   Video uploads
-   Thumbnail uploads
-   Metadata management
-   Featured-content controls

The administrator workflow was verified, including successful video
upload using the configured Amazon S3 bucket.

## S3

S3 configuration uses:

``` text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

These values are supplied to Kubernetes workloads through the Helm
Secret configuration.

## Streaming

The streaming service provides:

-   Video catalogue APIs
-   Streaming endpoints
-   S3-backed media access
-   Public streaming routes

The internal Kubernetes service is:

``` text
streaming-svc:3002
```

## Chat

The chat service provides:

-   REST chat APIs
-   WebSocket/Socket.IO communication
-   Live messaging functionality
-   Persistent chat message support

The internal Kubernetes service is:

``` text
chat-svc:3004
```

and its Ingress path is:

``` text
/api/chat
```

------------------------------------------------------------------------

# Verification Commands

### Pods

``` bash
kubectl get pods
```

### Services

``` bash
kubectl get svc
```

### Ingress

``` bash
kubectl get ingress
```

### Combined

``` bash
kubectl get pods,svc,ingress
```

### Helm releases

``` bash
helm list
```

### Helm status

``` bash
helm status streamingapp
```

### Streaming replicas

``` bash
kubectl get deployment streaming
kubectl get pods -l app=streaming
```

### Rollout status

``` bash
kubectl rollout status deployment/auth
kubectl rollout status deployment/streaming
kubectl rollout status deployment/admin
kubectl rollout status deployment/chat
kubectl rollout status deployment/frontend
```

------------------------------------------------------------------------

# Troubleshooting

## View logs

``` bash
kubectl logs deployment/auth
kubectl logs deployment/streaming
kubectl logs deployment/admin
kubectl logs deployment/chat
kubectl logs deployment/frontend
```

## Describe resources

``` bash
kubectl describe deployment <deployment-name>
kubectl describe pod <pod-name>
kubectl describe svc <service-name>
kubectl describe ingress streamingapp-ingress
```

## Restart a deployment

``` bash
kubectl rollout restart deployment/admin
kubectl rollout restart deployment/streaming
```

Then:

``` bash
kubectl rollout status deployment/admin
kubectl rollout status deployment/streaming
```

## Verify environment variables

``` bash
kubectl exec deployment/admin -- printenv AWS_S3_BUCKET
kubectl exec deployment/streaming -- printenv AWS_S3_BUCKET
```

## Check Helm configuration

``` bash
helm get values streamingapp
helm status streamingapp
```

------------------------------------------------------------------------

# Production Improvements

The current configuration is intended for a local Kubernetes
demonstration. A production deployment should add additional reliability
and security controls.

## Namespaces

Use dedicated namespaces instead of the default namespace.

``` bash
kubectl create namespace streamingapp
```

## TLS

Use HTTPS with cert-manager and a trusted certificate authority.

The Ingress should reference a Kubernetes TLS Secret.

## Horizontal Pod Autoscaling

Configure HPA for stateless services such as streaming, authentication,
administration, chat, and frontend.

Example:

``` bash
kubectl autoscale deployment streaming   --cpu-percent=70   --min=2   --max=10
```

## Managed MongoDB

For production, use a managed database such as MongoDB Atlas or Amazon
DocumentDB rather than relying on a single local MongoDB StatefulSet
pod.

## Secrets Management

Use a dedicated secrets solution such as AWS Secrets Manager, External
Secrets Operator, HashiCorp Vault, or appropriately secured Kubernetes
Secrets.

## Resource Requests and Limits

Define CPU and memory requests/limits for every workload.

## Observability

Add centralized logging, Prometheus metrics, Grafana dashboards,
alerting, and Kubernetes monitoring.

## High Availability

For a production EKS/AKS/GKE cluster, run worker nodes across
availability zones and maintain multiple replicas of stateless
workloads.

## CI/CD Expansion

A production Jenkins pipeline could:

1.  Checkout source
2.  Run automated tests
3.  Build Docker images
4.  Push versioned images
5.  Update Helm values
6.  Deploy to staging
7.  Run smoke tests
8.  Require approval
9.  Promote to production

------------------------------------------------------------------------

# Assignment Deliverables

The repository contains:

-   Dockerfiles for all five services
-   Versioned Docker images
-   Kubernetes Deployments
-   Kubernetes Services
-   ConfigMap
-   Kubernetes Secret template
-   MongoDB StatefulSet
-   MongoDB persistent storage
-   Readiness/liveness probes
-   Helm chart
-   Helm values
-   NGINX Ingress
-   Jenkinsfile
-   Application source code
-   Project documentation

### Demonstrated deployment areas

-   Containerization of all five services
-   Docker image versioning and Docker Hub publishing
-   Kubernetes orchestration
-   Helm chart validation
-   Ingress configuration
-   Four-replica streaming deployment
-   Rolling updates
-   Kubernetes self-healing
-   Administrator authentication
-   S3-backed video upload
-   Jenkins CI execution

### Verification limitations

Video playback and the frontend chat UI were not included in the final
smoke-test evidence. The corresponding backend services and Kubernetes
routes remain part of the deployment.

------------------------------------------------------------------------

# Quick Reference

## Start Compose

``` bash
docker compose up --build
```

## Stop Compose

``` bash
docker compose down
```

## Validate Helm

``` bash
helm lint ./streamingapp
helm template streamingapp ./streamingapp
```

## Install

``` bash
helm install streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml
```

## Upgrade

``` bash
helm upgrade streamingapp ./streamingapp   -f ./streamingapp/secrets.local.yaml
```

## Kubernetes status

``` bash
kubectl get pods,svc,ingress
```

## Scale streaming

``` bash
kubectl scale deployment/streaming --replicas=4
```

## Check rollout

``` bash
kubectl rollout status deployment/streaming
```

## Delete a pod for self-healing verification

``` bash
kubectl delete pod <pod-name>
```

## View logs

``` bash
kubectl logs deployment/<deployment-name>
```

## Remove Helm release

``` bash
helm uninstall streamingapp
```

------------------------------------------------------------------------

# Security Notes

Never commit:

``` text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
JWT_SECRET
secrets.local.yaml
.env
```

Use environment variables, Kubernetes Secrets, or a dedicated secrets
manager.

All credential examples in this README are placeholders.

------------------------------------------------------------------------

# License

MIT © StreamFlix Team
