# hello-world-ts

Sample TypeScript project menggunakan **Bun** + **Elysia** yang dapat di-deploy ke **Google Cloud Run** via **Cloud Build**.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) v1 (Alpine)
- **Framework**: [Elysia](https://elysiajs.com/)
- **Language**: TypeScript
- **Deploy**: Google Cloud Build → Cloud Run

## Struktur Project

```
.
├── src/
│   └── index.ts          # Entry point - HTTP server
├── Dockerfile            # Multi-stage Docker build (oven/bun:1-alpine)
├── cloudbuild.yaml       # Cloud Build pipeline
├── package.json
├── tsconfig.json
└── .gcloudignore
```

## Endpoints

| Method | Path | Response |
|--------|------|----------|
| GET | `/` | `{ message: "Hello World", timestamp, status }` |
| GET | `/health` | `{ status: "healthy", uptime }` |

## Local Development

```bash
# Install dependencies
bun install

# Run dev server (with hot reload)
bun run dev

# Run production server
bun run start
```

Server berjalan di `http://localhost:3000`

## Deploy via Cloud Build

### Prerequisites

1. **GCP Project** dengan billing aktif
2. **Artifact Registry** repository sudah dibuat
3. **Cloud Run API** sudah diaktifkan
4. **Cloud Build** service account memiliki permission:
   - `roles/run.admin`
   - `roles/iam.serviceAccountUser`
   - `roles/artifactregistry.writer`

### Manual Deploy

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions \
    _REGION=asia-southeast2,\
    _REPO=hello-world-repo,\
    _SERVICE_NAME=hello-world-ts \
  .
```

### Substitution Variables

| Variable | Default | Keterangan |
|----------|---------|------------|
| `_REGION` | `asia-southeast2` | GCP region (Jakarta) |
| `_REPO` | `hello-world-repo` | Artifact Registry repo name |
| `_SERVICE_NAME` | `hello-world-ts` | Cloud Run service name |
| `_MIN_INSTANCES` | `0` | Scale-to-zero |
| `_MAX_INSTANCES` | `5` | Maksimum instances |
| `_MEMORY` | `256Mi` | Memory per instance |
| `_CPU` | `1` | CPU per instance |

Setelah deploy berhasil, Cloud Run akan memberikan URL HTTPS otomatis seperti:
```
https://hello-world-ts-xxxxxxxxxx-et.a.run.app
```
