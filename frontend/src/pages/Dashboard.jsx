import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Folder, File, Upload, Plus, LogOut, ArrowLeft, Info } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderSize, setFolderSize] = useState(null);

  const fetchContents = (folderId = null) => {
    setFolders(allFolders.filter(f => f.parentId === folderId));
    setFiles(allFiles.filter(f => f.parentId === folderId));
    setFolderSize(null);
  };

  useEffect(() => {
    fetchContents(currentFolder?._id || null);
  }, [currentFolder, allFolders, allFiles]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    const newFolder = {
      _id: Date.now().toString(),
      name: newFolderName,
      parentId: currentFolder?._id || null
    };
    setAllFolders([...allFolders, newFolder]);
    setNewFolderName('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile = {
        _id: Date.now().toString(),
        name: file.name,
        size: file.size,
        url: event.target.result,
        parentId: currentFolder?._id || null
      };
      setAllFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const navigateToFolder = (folder) => {
    setFolderHistory([...folderHistory, currentFolder]);
    setCurrentFolder(folder);
  };

  const goBack = () => {
    const prevFolder = folderHistory[folderHistory.length - 1];
    const newHistory = folderHistory.slice(0, -1);
    setFolderHistory(newHistory);
    setCurrentFolder(prevFolder);
  };

  const calculateSize = () => {
    if (!currentFolder) return;
    let totalSize = 0;
    const calculate = (folderId) => {
      const fFiles = allFiles.filter(f => f.parentId === folderId);
      totalSize += fFiles.reduce((acc, curr) => acc + curr.size, 0);
      const subFolders = allFolders.filter(f => f.parentId === folderId);
      subFolders.forEach(sf => calculate(sf._id));
    };
    calculate(currentFolder._id);
    setFolderSize(totalSize);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="container">
      <div className="header">
        <div className="breadcrumbs">
          {currentFolder ? (
            <>
              <button onClick={goBack} className="btn" style={{ padding: '0.25rem 0.5rem', marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
              {currentFolder.name}
              <button onClick={calculateSize} className="btn" style={{ marginLeft: '1rem', background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={16} /> Get Total Size
              </button>
              {folderSize !== null && <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '1rem' }}>({formatBytes(folderSize)})</span>}
            </>
          ) : 'My Drive'}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user.email}</span>
          <button onClick={logout} className="btn" style={{ background: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New folder name"
            className="input"
            style={{ marginBottom: 0 }}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Create Folder
          </button>
        </form>

        <label className="btn" style={{ background: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <Upload size={16} /> Upload Image
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />
        </label>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Folders</h3>
      <div className="grid" style={{ marginBottom: '2rem' }}>
        {folders.length === 0 && <p style={{ color: 'gray' }}>No folders</p>}
        {folders.map(f => (
          <div key={f._id} className="folder-item" onDoubleClick={() => navigateToFolder(f)}>
            <Folder className="icon" fill="#FBBF24" color="#F59E0B" />
            <span style={{ fontWeight: 500 }}>{f.name}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Files</h3>
      <div className="grid">
        {files.length === 0 && <p style={{ color: 'gray' }}>No files</p>}
        {files.map(f => (
          <div key={f._id} className="file-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', width: '100%' }}>
              <File className="icon" color="#3B82F6" />
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            </div>
            {(f.name.match(/\.(jpeg|jpg|gif|png)$/i) || f.url.startsWith('data:image')) && (
              <img src={f.url} alt={f.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <span style={{ fontSize: '0.8rem', color: 'gray', marginTop: '0.5rem' }}>{formatBytes(f.size)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
