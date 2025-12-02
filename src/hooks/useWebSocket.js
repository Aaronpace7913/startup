import { useEffect, useRef, useState } from 'react';

export function useWebSocket(projectId, userEmail) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userEmail) return;

    function connect() {
      // Prevent too many reconnection attempts
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        return;
      }

      // Determine WebSocket protocol and port
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In development (Vite on 5173), connect to backend port 4000
      // In production, use same host
      const isDev = window.location.port === '5173' || window.location.hostname === 'localhost';
      const host = isDev ? 'localhost:4000' : window.location.host;
      const wsUrl = `${protocol}//${host}`;
      
      console.log(`Connecting to WebSocket: ${wsUrl} (attempt ${reconnectAttempts.current + 1})`);
      
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('WebSocket connected successfully');
          setIsConnected(true);
          reconnectAttempts.current = 0; // Reset on successful connection
          
          // Authenticate the connection
          ws.current.send(JSON.stringify({
            type: 'auth',
            projectId: projectId,
            userEmail: userEmail
          }));
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            setLastMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.current.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          setIsConnected(false);
          
          // Only attempt to reconnect if not a normal closure
          if (event.code !== 1000) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            
            console.log(`Attempting to reconnect in ${delay}ms...`);
            reconnectTimeout.current = setTimeout(() => {
              connect();
            }, delay);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reconnectAttempts.current++;
        
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        // Close with normal closure code
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [projectId, userEmail]);

  return { isConnected, lastMessage };
}