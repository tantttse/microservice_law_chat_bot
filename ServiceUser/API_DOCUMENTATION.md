# Vietnamese Traffic Law Chatbot - API Documentation

## 📋 Overview

This document provides comprehensive information about the Vietnamese Traffic Law Chatbot API for frontend developers. The API supports both guest and authenticated users with streaming responses (ChatGPT-like experience).

## 🚀 Base URL

```
http://localhost:3000
```

---

## 🤖 Chatbot Endpoints

### 1. **Regular Chat** (Non-streaming)

```http
POST /chatbot/chat
```

#### **Headers**

```http
Content-Type: application/json
Authorization: Bearer <token>        # Optional - for authenticated users
X-Guest-ID: <guest-session-id>       # Optional - for guest users
```

#### **Request Body**

```json
{
  "message": "What is the speed limit on highways in Vietnam?",
  "conversationId": 1, // Optional - only for authenticated users
  "guestSessionId": "guest_12345" // Optional - for guest users
}
```

#### **Response**

```json
{
  "success": true,
  "data": {
    "response": "In Vietnam, the speed limit on highways is typically 120 km/h for cars and 90 km/h for motorcycles...",
    "conversationId": 1, // null for guest users
    "messageId": 5, // null for guest users
    "guestSessionId": "guest_12345", // only for guest users
    "timestamp": "2025-06-30T10:30:00Z"
  }
}
```

---

### 2. **Streaming Chat** (ChatGPT-like)

```http
POST /chatbot/chat/stream
```

#### **Headers**

```http
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <token>        # Optional - for authenticated users
X-Guest-ID: <guest-session-id>       # Optional - for guest users
```

#### **Request Body**

```json
{
  "message": "Explain Vietnam traffic laws for motorcycles",
  "conversationId": 1, // Optional - only for authenticated users
  "guestSessionId": "guest_12345" // Optional - for guest users
}
```

#### **Streaming Response (Server-Sent Events)**

The response is sent as Server-Sent Events (SSE) with the following event types:

##### **Start Event**

```
data: {
  "type": "start",
  "guestSessionId": "guest_12345",   // Only for guest users
  "conversationId": 1,               // Only for authenticated users
  "timestamp": "2025-06-30T10:30:00Z"
}
```

##### **Token Events** (Multiple)

```
data: {
  "type": "token",
  "token": "In Vietnam, ",
  "position": 1
}

data: {
  "type": "token",
  "token": "motorcycles ",
  "position": 2
}
```

##### **Complete Event**

```
data: {
  "type": "complete",
  "fullResponse": "In Vietnam, motorcycles must follow specific traffic laws...",
  "metadata": {
    "conversationId": 1,             // null for guest users
    "messageId": 5,                  // null for guest users
    "guestSessionId": "guest_12345", // only for guest users
    "timestamp": "2025-06-30T10:30:00Z"
  }
}
```

##### **Error Event**

```
data: {
  "type": "error",
  "message": "Failed to generate response",
  "code": "GENERATION_ERROR"
}
```

---

## 👤 User Management

### 3. **Guest History**

```http
GET /chatbot/guest/history
```

#### **Headers**

```http
X-Guest-ID: <guest-session-id>       # Required
```

#### **Response**

```json
{
  "success": true,
  "data": {
    "guestSessionId": "guest_12345",
    "messages": [
      {
        "message": "What is the speed limit?",
        "response": "In Vietnam, the speed limit...",
        "timestamp": "2025-06-30T10:30:00Z"
      }
    ],
    "totalMessages": 5,
    "createdAt": "2025-06-30T10:00:00Z",
    "lastActivity": "2025-06-30T10:30:00Z"
  }
}
```

### 4. **User Conversations** (Authenticated)

```http
GET /chatbot/conversations
```

#### **Headers**

```http
Authorization: Bearer <token>        # Required
```

#### **Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Traffic Laws Discussion",
      "createdAt": "2025-06-30T10:00:00Z",
      "updatedAt": "2025-06-30T10:30:00Z",
      "messageCount": 8
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### 5. **Conversation History** (Authenticated)

```http
GET /chatbot/conversations/:conversationId/history
```

#### **Headers**

```http
Authorization: Bearer <token>        # Required
```

#### **Response**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 1,
      "title": "Traffic Laws Discussion",
      "createdAt": "2025-06-30T10:00:00Z"
    },
    "messages": [
      {
        "id": 1,
        "message": "What is the speed limit?",
        "response": "In Vietnam, the speed limit...",
        "timestamp": "2025-06-30T10:15:00Z"
      }
    ],
    "totalMessages": 8
  }
}
```

---

## 🔐 Authentication Endpoints

### 6. **Register**

```http
POST /auth/register
```

#### **Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### **Response**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Registration successful"
  }
}
```

### 7. **Login**

```http
POST /auth/login
```

#### **Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **Response**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login successful"
  }
}
```

### 8. **Get Profile**

```http
GET /auth/profile
```

#### **Headers**

```http
Authorization: Bearer <token>        # Required
```

### 9. **Update Profile**

```http
PUT /auth/profile
```

#### **Headers**

```http
Authorization: Bearer <token>        # Required
```

#### **Request Body**

```json
{
  "email": "newemail@example.com", // Optional
  "firstName": "Jane", // Optional
  "lastName": "Smith" // Optional
}
```

---

## 💡 Frontend Implementation Guide

### **Guest User Flow**

```javascript
// 1. Generate or retrieve guest ID
let guestId = localStorage.getItem("guestSessionId") || generateGuestId();
localStorage.setItem("guestSessionId", guestId);

// 2. Send streaming message
const response = await fetch("/chatbot/chat/stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "X-Guest-ID": guestId,
  },
  body: JSON.stringify({
    message: userMessage,
    guestSessionId: guestId,
  }),
});

// 3. Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      handleStreamingEvent(data);
    }
  }
}

function handleStreamingEvent(data) {
  switch (data.type) {
    case "start":
      showTypingIndicator();
      if (data.guestSessionId) {
        localStorage.setItem("guestSessionId", data.guestSessionId);
      }
      break;

    case "token":
      appendTokenToMessage(data.token);
      break;

    case "complete":
      hideTypingIndicator();
      finalizeMessage(data.fullResponse);
      break;

    case "error":
      showError(data.message);
      break;
  }
}
```

### **Authenticated User Flow**

```javascript
// 1. Send message with authentication
const response = await fetch("/chatbot/chat/stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    Authorization: `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    message: userMessage,
    conversationId: currentConversationId, // Optional
  }),
});

// 2. Handle streaming (same as guest)
// 3. Get conversations list
const conversations = await fetch("/chatbot/conversations", {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});
```

### **Helper Functions**

```javascript
function generateGuestId() {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

function getHeaders(includeAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth && isAuthenticated()) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("authToken")}`;
  }

  const guestId = localStorage.getItem("guestSessionId");
  if (!isAuthenticated() && guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  return headers;
}
```

---

## 🎯 Key Features

### **Streaming Response States**

- **`start`**: Bot begins thinking (show loader)
- **`token`**: Bot is typing (show streaming text)
- **`complete`**: Bot finished (hide loader, show final response)
- **`error`**: Something went wrong (show error message)

### **User Types**

- **Guest Users**: Temporary sessions, in-memory storage
- **Authenticated Users**: Persistent conversations, database storage

### **Context Awareness**

- Bot uses conversation history for context-aware responses
- Supports continuing existing conversations
- Maintains context within each session/conversation

---

## 🚨 Error Handling

### **Common Error Responses**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message is required",
    "details": {
      "field": "message",
      "constraint": "Message cannot be empty"
    }
  }
}
```

### **HTTP Status Codes**

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

---

## 🔧 Development Notes

1. **Guest Sessions**: Auto-expire after 1 hour of inactivity
2. **Rate Limiting**: May be implemented (check response headers)
3. **CORS**: Ensure proper CORS configuration for your domain
4. **WebSocket Alternative**: Current implementation uses SSE, but WebSocket support may be added later
5. **Conversation Limits**: Authenticated users have unlimited conversations; guests have single active session

---

## 📞 Support

For questions or issues, contact the backend development team or check the API logs for detailed error information.
