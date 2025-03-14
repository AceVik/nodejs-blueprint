import type { us_listen_socket } from 'uWebSockets.js';

export type UWSListenCallback = (listenSocket: us_listen_socket) => void;

type ListenSocket = {
  /**
   * The thread ID that the listen socket is running on. If undefined, the listen socket is running on the main thread.
   */
  threadId?: number;
  listenSocket: us_listen_socket;
};

export type ListenCallback = (listenSocket: ListenSocket) => void;