import { useEffect, useRef, useState } from 'react';

export function useWebSocket(projectId, userEmail) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (!userEmail) {
      console.log('No userEmail provided, skipping WebSocket connection');
      return;
    }

    function connect() {
      // Determine WebSocket protocol based on current protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      console.log(`Connecting to WebSocket: ${wsUrl} for project ${projectId}, user ${userEmail}`);
      
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          
          // Authenticate the connection
          const authMessage = {
            type: 'auth',
            projectId: projectId,
            userEmail: userEmail
          };
          console.log('Sending auth message:', authMessage);
          ws.current.send(JSON.stringify(authMessage));
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
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeout.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    }

    connect();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [projectId, userEmail]);

  return { isConnected, lastMessage };
}