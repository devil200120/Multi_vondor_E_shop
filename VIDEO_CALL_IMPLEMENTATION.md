# Video Call Feature Implementation

## Overview
This document describes the complete video call feature implementation that allows sellers to initiate video calls with customers for order support and general inquiries.

## Architecture

### Backend Components

#### 1. Database Model (`backend/model/videoCall.js`)
- **VideoCall Schema**: Tracks all video call sessions with comprehensive analytics
- **Fields**: 
  - `callId`: Unique identifier for each call
  - `sellerId`, `customerId`: Participant IDs
  - `orderId`: Optional order reference for support calls
  - `status`: Call status (initiated, accepted, declined, completed, failed, missed)
  - `duration`: Call duration in seconds
  - `startTime`, `endTime`: Call timestamps
  - `analytics`: Call quality and technical metrics

#### 2. API Controller (`backend/controller/videoCall.js`)
- **initiateVideoCall**: Start new call session
- **respondToVideoCall**: Accept/decline incoming calls
- **endVideoCall**: Terminate active calls
- **getCallHistory**: Retrieve seller call history
- **getCustomerHistory**: Retrieve customer call history
- **getCustomers**: Get eligible customers for calls
- **getCallAnalytics**: Generate call statistics

#### 3. API Routes (`backend/routes/videoCall.js`)
- Protected endpoints with authentication middleware
- Separate seller and customer access controls
- RESTful API design with proper error handling

#### 4. Socket.io Integration (`socket/index.js`)
- **WebRTC Signaling**: Handle offer/answer/ICE candidate exchange
- **Call Management**: Join/leave call rooms, status updates
- **Real-time Events**: Call initiation, acceptance, termination
- **Audio/Video Controls**: Mute/unmute, video on/off, screen sharing

### Frontend Components

#### 1. Seller Dashboard (`frontend/src/components/Shop/VideoCall/`)

##### VideoCallManager.jsx
- Main dashboard for seller video call management
- Handles incoming call notifications
- Manages socket connections and call state
- Integrates with CustomersList and CallHistory components

##### VideoCallInterface.jsx
- Full-screen video call interface with WebRTC
- Camera/microphone controls
- Screen sharing capabilities
- Call duration tracking and connection status
- Picture-in-picture local video

##### CustomersList.jsx
- Display available customers for video calls
- Search and filter functionality
- Customer statistics and recent orders
- Quick call initiation from order context

##### CallHistory.jsx
- Complete call history with detailed analytics
- Call status tracking and duration reports
- Order integration for support calls
- Export and filtering capabilities

#### 2. Customer Components (`frontend/src/components/Customer/`)

##### CustomerVideoCall.jsx
- Global incoming call notification system
- Call acceptance/decline interface
- Call history widget for recent calls
- Browser notification integration with ringtone

### WebRTC Implementation

#### Features
- **Video/Audio Calling**: Peer-to-peer communication
- **Screen Sharing**: Share desktop for product demonstrations
- **Call Controls**: Mute/unmute audio and video
- **Connection Monitoring**: Real-time quality assessment
- **Auto-recovery**: Handle network disconnections gracefully

#### Technical Stack
- **WebRTC APIs**: getUserMedia, RTCPeerConnection, getDisplayMedia
- **Socket.io**: Real-time signaling and call management
- **STUN Servers**: Google STUN servers for NAT traversal

## Installation & Setup

### Backend Setup

1. **Install Dependencies** (already included in package.json):
   ```bash
   cd backend
   npm install
   ```

2. **Database Models**: VideoCall model is auto-created by Mongoose

3. **Socket Server**: 
   ```bash
   cd socket
   npm install
   npm start  # Runs on port 4000
   ```

### Frontend Setup

1. **Environment Variables** (already configured in .env):
   ```
   REACT_APP_SOCKET_URL=http://localhost:4000
   REACT_APP_SERVER_URL=http://localhost:8000/api/v2
   ```

2. **Dependencies** (already included):
   - socket.io-client: Real-time communication
   - date-fns: Date formatting
   - react-toastify: Notifications

## Usage Guide

### For Sellers

1. **Access Video Calls**:
   - Navigate to Seller Dashboard
   - Click "Video Calls" in the sidebar (new menu item added)

2. **Initiate Calls**:
   - View customer list with order history
   - Click "Video Call" button for general calls
   - Click phone icon next to specific orders for order support

3. **During Calls**:
   - Toggle audio/video controls
   - Share screen for product demonstrations
   - End call when support is complete

4. **Call History**:
   - View complete call analytics
   - Track call duration and outcomes
   - Access recordings (if implemented)

### For Customers

1. **Receiving Calls**:
   - Incoming call notifications appear globally
   - Browser notifications with ringtone alerts
   - Accept/decline with large clear buttons

2. **During Calls**:
   - Full video interface with controls
   - See seller's shared screen content
   - End call anytime with clear controls

3. **Call History**:
   - Small widget shows recent calls (bottom-right)
   - Minimizable interface doesn't obstruct shopping

## API Endpoints

### Seller Endpoints
- `POST /api/v2/video-call/initiate` - Start new call
- `GET /api/v2/video-call/history/:sellerId` - Get call history
- `GET /api/v2/video-call/customers/:sellerId` - Get eligible customers
- `GET /api/v2/video-call/analytics/:sellerId` - Get call analytics

### Customer Endpoints  
- `POST /api/v2/video-call/respond` - Accept/decline calls
- `GET /api/v2/video-call/customer-history/:customerId` - Get customer call history

### Shared Endpoints
- `POST /api/v2/video-call/end` - End active call

## Socket Events

### Call Management
- `joinVideoCall` - Join call room
- `leaveVideoCall` - Leave call room
- `callStatusUpdate` - Status changes
- `endVideoCall` - Terminate call

### WebRTC Signaling
- `offer` - WebRTC offer
- `answer` - WebRTC answer  
- `ice-candidate` - ICE candidates

### Media Controls
- `toggleAudio` - Audio mute/unmute
- `toggleVideo` - Video on/off
- `startScreenShare` - Begin screen sharing
- `stopScreenShare` - End screen sharing

## Security Considerations

1. **Authentication**: All API endpoints require valid JWT tokens
2. **Authorization**: Sellers can only access their customers, customers can only see their own data
3. **Call Validation**: Verify caller/callee relationships before allowing calls
4. **Rate Limiting**: Prevent call spam (future enhancement)
5. **WebRTC Security**: STUN servers and encrypted peer connections

## Future Enhancements

1. **Call Recording**: Store call recordings for quality assurance
2. **TURN Servers**: For users behind restrictive NAT/firewalls
3. **Call Scheduling**: Allow customers to book support calls
4. **Multi-party Calls**: Support multiple participants
5. **Chat Integration**: Text chat during video calls
6. **Mobile App Support**: Native mobile video calling
7. **Call Analytics Dashboard**: Advanced metrics and insights
8. **Call Quality Optimization**: Adaptive bitrate and quality controls

## Testing

### Manual Testing Steps

1. **Setup**:
   - Start backend server (port 8000)
   - Start socket server (port 4000)
   - Start frontend (port 3000)

2. **Test Call Flow**:
   - Login as seller
   - Navigate to Video Calls dashboard
   - Initiate call to customer
   - Accept call from customer side
   - Test audio/video controls
   - End call and verify history

3. **Test Error Scenarios**:
   - Network disconnection during call
   - User denies camera/microphone permissions
   - Call recipient is offline
   - Multiple simultaneous calls

## Troubleshooting

### Common Issues

1. **Camera/Microphone Permission Denied**:
   - Browser settings blocking media access
   - HTTPS required for WebRTC in production

2. **Connection Failed**:
   - Check STUN server accessibility
   - Verify socket.io connection
   - Firewall blocking WebRTC ports

3. **No Audio/Video**:
   - Check device permissions
   - Verify media stream initialization
   - Test with different browsers

### Debug Tools
- Browser DevTools WebRTC internals
- Socket.io connection status
- Network tab for signaling errors
- Console logs for detailed error tracking

## Integration Points

### Existing Systems
- **Order Management**: Video calls linked to specific orders
- **Customer Support**: Integration with existing message system
- **Authentication**: Uses existing JWT authentication
- **User Management**: Leverages current user/seller models

### Database Relationships
- VideoCall → User (customer)
- VideoCall → Shop (seller)
- VideoCall → Order (optional support context)
- VideoCall → Conversation (future chat integration)

This comprehensive video call feature enhances customer support capabilities and provides a modern, interactive shopping experience while maintaining security and performance standards.