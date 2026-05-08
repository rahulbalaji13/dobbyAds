import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Folder, File, Upload, Plus, LogOut, ArrowLeft, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderSize, setFolderSize] = useState(null);

  const authConfig = {
    headers: { Authorization: `Bearer ${user?.token}` }
  };

  const fetchContents = async (folderId = null) => {
    const params = folderId ? { parentId: folderId } : {};
    const response = await axios.get(`${API_BASE_URL}/api/folders`, { ...authConfig, params });
    setFolders(response.data.folders);
    setFiles(response.data.files);
    setFolderSize(null);
  };

  useEffect(() => {
    if (user?.token) fetchContents(currentFolder?._id || null);
  }, [currentFolder, user?.token]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    await axios.post(`${API_BASE_URL}/api/folders`, {
      name: newFolderName,
      parentId: currentFolder?._id || null
    }, authConfig);
    setNewFolderName('');
    fetchContents(currentFolder?._id || null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder?._id) formData.append('folderId', currentFolder._id);

    await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    fetchContents(currentFolder?._id || null);
  };

  const navigateToFolder = (folder) => {
    setFolderHistory([...folderHistory, currentFolder]);
    setCurrentFolder(folder);
  };

  const goBack = () => {
    const prevFolder = folderHistory[folderHistory.length - 1] || null;
    setFolderHistory(folderHistory.slice(0, -1));
    setCurrentFolder(prevFolder);
  };

  const calculateSize = async () => {
    if (!currentFolder) return;
    const response = await axios.get(`${API_BASE_URL}/api/folders/${currentFolder._id}/size`, authConfig);
    setFolderSize(response.data.size);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (<div className="container">{/* unchanged UI */}
    <div className="header"><div className="breadcrumbs">{currentFolder ? <><button onClick={goBack} className="btn" style={{ padding: '0.25rem 0.5rem', marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeft size={16} /> Back</button>{currentFolder.name}<button onClick={calculateSize} className="btn" style={{ marginLeft: '1rem', background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={16} /> Get Total Size</button>{folderSize !== null && <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '1rem' }}>({formatBytes(folderSize)})</span>}</> : 'My Drive'}</div><div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><span>{user.email}</span><button onClick={logout} className="btn" style={{ background: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogOut size={16} /> Logout</button></div></div>
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}><form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '0.5rem' }}><input type="text" placeholder="New folder name" className="input" style={{ marginBottom: 0 }} value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} /><button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} /> Create Folder</button></form><label className="btn" style={{ background: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Upload size={16} /> Upload Image<input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" /></label></div>
    <h3 style={{ marginBottom: '1rem' }}>Folders</h3><div className="grid" style={{ marginBottom: '2rem' }}>{folders.length === 0 && <p style={{ color: 'gray' }}>No folders</p>}{folders.map(f => <div key={f._id} className="folder-item" onDoubleClick={() => navigateToFolder(f)}><Folder className="icon" fill="#FBBF24" color="#F59E0B" /><span style={{ fontWeight: 500 }}>{f.name}</span></div>)}</div>
    <h3 style={{ marginBottom: '1rem' }}>Files</h3><div className="grid">{files.length === 0 && <p style={{ color: 'gray' }}>No files</p>}{files.map(f => <div key={f._id} className="file-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}><div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', width: '100%' }}><File className="icon" color="#3B82F6" /><span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span></div>{(f.name.match(/\.(jpeg|jpg|gif|png)$/i) || f.url?.includes('files/content')) && <img src={`${API_BASE_URL}${f.url}`} alt={f.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} /> }<span style={{ fontSize: '0.8rem', color: 'gray', marginTop: '0.5rem' }}>{formatBytes(f.size)}</span></div>)}</div>
  </div>);
}
