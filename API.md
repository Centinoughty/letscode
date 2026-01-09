# API Documentation

## Auth Related Endpoints

### Register a user

```bash
curl -X POST http://localhost:5000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username": "", "email": "", "password": ""}'
```

### Login a user

```bash
curl -X POST http://localhost:5000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier": "", "password": ""}'
```

### Get a user data

```bash
curl -X GET http://localhost:5000/auth/me \
  -H 'Authorization: Bearer '
```

### Delete a user

```bash
curl -X DELETE http://localhost:5000/auth/delete \
  -H 'Authorization: Bearer '
```

## Workspace Related Endpoints

### Create a workspace

```bash
curl -X POST http://localhost:5000/workspace/create \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ' \
  -d '{"name": ""}'
```

### Get all workspaces for a user

```bash
curl -X GET http://localhost:5000/workspace \
  -H 'Authorization: Bearer '
```

### Delete a workspace

```bash
curl -X DELETE http://localhost:5000/workspace/:id \
  -H 'Authorization: Bearer '
```

## Collaborator Related Endpoints

### Add a collaborator

```bash
curl -X POST http://localhost:5000/workspace/:workspaceId/members \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ' \
  -d '{"memberId": "", "permission": ""}'
```

### List all collaborators for a workspace

```bash
curl -X GET http://localhost:5000/workspace/:workspaceId/members \
  -H 'Authorization: Bearer '
```

### Update collaborator permission level

```bash
curl -X PATCH http://localhost:5000/workspace/:workspaceId/members \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ' \
  -d '{"memberId": "", "permission": ""}'
```

### Remove a collaborator

```bash
curl -X DELETE http://localhost:5000/workspace/:workspaceId/members \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ' \
  -d '{"memberId": ""}'
```
