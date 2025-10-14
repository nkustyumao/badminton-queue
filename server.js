/**
 * 自定義 Next.js 服務器 with Socket.IO 支援
 * 用於實現 WebSocket 實時同步功能
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// 初始化 Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 儲存 Socket.IO 實例
let io;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('處理請求時發生錯誤:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // 初始化 Socket.IO
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    // 配置選項
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // 監聽客戶端連接
  io.on('connection', (socket) => {
    console.log('✅ 客戶端已連接:', socket.id);

    // 監聽客戶端斷開
    socket.on('disconnect', (reason) => {
      console.log('❌ 客戶端已斷開:', socket.id, '原因:', reason);
    });

    // 監聽錯誤
    socket.on('error', (error) => {
      console.error('Socket 錯誤:', error);
    });
  });

  // 將 io 實例儲存到 global，讓 API 路由可以使用
  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error('服務器啟動失敗:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log('');
      console.log('🚀 ═══════════════════════════════════════════════════');
      console.log(`🎯 羽球排隊系統正在運行`);
      console.log(`📡 HTTP 服務器: http://${hostname}:${port}`);
      console.log(`⚡ WebSocket 已啟用 (Socket.IO)`);
      console.log(`🔧 環境: ${dev ? '開發模式' : '生產模式'}`);
      console.log('═══════════════════════════════════════════════════');
      console.log('');
    });
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉服務器...');
  if (io) {
    io.close(() => {
      console.log('WebSocket 連接已關閉');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('\n收到 SIGINT 信號，正在關閉服務器...');
  if (io) {
    io.close(() => {
      console.log('WebSocket 連接已關閉');
      process.exit(0);
    });
  }
});

