import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Folder, File, Upload, Plus, LogOut, ArrowLeft, Info } from 'lucide-react';
import { api as sharedApi, API_BASE_URL } from '../lib/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderSize, setFolderSize] = useState(null);

  const api = useMemo(() => {
    return axios.create({
      baseURL: sharedApi.defaults.baseURL,
      headers: { Authorization: `Bearer ${user?.token}` },
    });
  }, [user?.token]);

  const fetchContents = async (folderId = null) => {
    const params = folderId ? { parentId: folderId } : {};
    const { data } = await api.get('/api/folders', { params });
    setFolders(data.folders || []);
    setFiles(data.files || []);
    setFolderSize(null);
  };

  useEffect(() => {
    if (user?.token) {
      fetchContents(currentFolder?._id || null);
    }
  }, [currentFolder, user?.token]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    await api.post('/api/folders', {
      name: newFolderName.trim(),
      parentId: currentFolder?._id || null,
    });

    setNewFolderName('');
    await fetchContents(currentFolder?._id || null);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (currentFolder?._id) {
      formData.append('folderId', currentFolder._id);
    }

    await api.post('/api/files/upload', formData, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    e.target.value = '';
    await fetchContents(currentFolder?._id || null);
  };

  const navigateToFolder = (folder) => {
    setFolderHistory((prev) => [...prev, currentFolder]);
    setCurrentFolder(folder);
  };

  const goBack = () => {
    const prevFolder = folderHistory[folderHistory.length - 1] || null;
    setFolderHistory((prev) => prev.slice(0, -1));
    setCurrentFolder(prevFolder);
  };

  const calculateSize = async () => {
    if (!currentFolder) return;
    const { data } = await api.get(`/api/folders/${currentFolder._id}/size`);
    setFolderSize(data.size);
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
          ) : (
            'My Drive'
          )}
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
        {folders.map((folder) => (
          <div key={folder._id} className="folder-item" onDoubleClick={() => navigateToFolder(folder)}>
            <Folder className="icon" fill="#FBBF24" color="#F59E0B" />
            <span style={{ fontWeight: 500 }}>{folder.name}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Files</h3>
      <div className="grid">
        {files.length === 0 && <p style={{ color: 'gray' }}>No files</p>}
        {files.map((file) => (
          <div key={file._id} className="file-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', width: '100%' }}>
              <File className="icon" color="#3B82F6" />
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
            </div>
            {(file.name.match(/\.(jpeg|jpg|gif|png)$/i) || file.url?.includes('files/content')) && (
              <img src={`${API_BASE_URL}${file.url}`} alt={file.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <span style={{ fontSize: '0.8rem', color: 'gray', marginTop: '0.5rem' }}>{formatBytes(file.size)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
