# 📝 Collaborative Editor

A real-time collaborative document editor with Google Docs-like features, built with React, Node.js, and Socket.io.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Rich Text Editing**: Full-featured text editor with formatting options
- **Image Support**: Insert and resize images within documents
- **Dark/Light Theme**: Toggle between dark and light modes
- **Auto-save**: Automatic document saving every 5 seconds
- **Download as .docx**: Export your documents as Microsoft Word files
- **Connected Users**: See who's currently editing the document
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** installed on your system.
- Download from: https://nodejs.org/ (LTS version recommended)
- Check installation: `node --version` and `npm --version`

### Installation & Setup

Follow these steps after unzipping the project:

#### Quick Installation (Recommended)
```bash
# Navigate to project
cd collaborative-editor

# Install all dependencies at once
npm run install:all

# Start the application
npm run dev
```

#### Manual Installation (Alternative)

If you prefer step-by-step:

##### 1. Navigate to the project folder
```bash
cd collaborative-editor
```

##### 2. Install root dependencies
```bash
npm install
```

##### 3. Install server dependencies
```bash
cd server
npm install
cd ..
```

##### 4. Install client dependencies
```bash
cd client
npm install
cd ..
```

##### 5. Start the application
```bash
npm run dev
```

This will start both the server (port 3001) and client (port 3000) simultaneously.

### 🏗️ Production Build

To create a production build:

```bash
npm run build
```

This creates an optimized production build in the `client/build` folder. You can deploy this folder to any static hosting service.

To serve the production build locally:
```bash
npm install -g serve
serve -s client/build
```

### 🎯 Quick Start (One-liner)

If you prefer, you can run all installation steps at once:

```bash
npm install && cd server && npm install && cd ../client && npm install && cd .. && npm run dev
```

## 📖 How to Use

1. **Open the app**: Navigate to `http://localhost:3000` in your browser
2. **Create a new Space**: Click "Create New Space" on the home page
3. **Share the Space ID**: Copy the Space ID and share it with your collaborators
4. **Start editing**: Begin typing in the editor - changes are synchronized in real-time!

### For Collaborators

1. Get the **Space ID** from the person who created the space
2. Open `http://localhost:3000`
3. Paste the Space ID and enter your username
4. Click "Join" to start collaborating!

## 🛠️ Tech Stack

- **Frontend**: React, Quill (Rich Text Editor)
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io
- **Styling**: Custom CSS with theme support
- **Document Export**: Mammoth.js for .docx conversion

## 📁 Project Structure

```
collaborative-editor/
├── client/              # React frontend
│   ├── public/         # Static assets
│   └── src/            # Source files
│       ├── components/ # React components
│       ├── services/   # API and socket services
│       └── styles.css  # Application styles
├── server/             # Node.js backend
│   ├── server.js       # Main server file
│   └── package.json    # Server dependencies
└── package.json        # Root dependencies
```

## 🎨 Features Breakdown

### Editor Controls
- **Edit/View Mode**: Toggle between editing and viewing
- **Save**: Manually save your document
- **Theme Toggle**: Switch between light and dark themes
- **Download**: Export as Microsoft Word (.docx) file
- **Sidebar**: View connected users and copy Space ID

### Formatting Options
- Headers (H1-H6)
- Bold, Italic, Underline
- Text color and background color
- Ordered and unordered lists
- Text alignment
- Images with resize capability
- Code blocks and quotes

## 🔧 Troubleshooting

### Port already in use
If you get an error about ports being in use:
- Change the port in `client/package.json` (default is 3000)
- Change the port in `server/server.js` (default is 3001)

### Connection issues
- Make sure both server and client are running
- Check that no firewall is blocking the ports
- Ensure you're using the correct URL (http://localhost:3000)

### Dependencies issues
If you encounter errors during installation:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm install && cd server && npm install && cd ../client && npm install
```

## 📝 Notes

- Documents are stored in memory on the server (they will be lost when the server restarts)
- For production use, consider adding a database for persistent storage
- Make sure to keep the server running for real-time collaboration to work

## 🤝 Contributing

Feel free to fork this project and make your own improvements!

## 📄 License

This project is open source and available for educational and personal use.

---

**Enjoy collaborating! 🎉**
