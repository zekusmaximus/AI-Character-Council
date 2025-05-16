// src/renderer/App.tsx (updated to use services)
import { useState, useEffect } from 'react';
import { ProjectService } from './services/databaseService';

function App() {
  const [status, setStatus] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    try {
      const response = await window.electron.ping();
      setStatus(`Connection successful: ${response}`);
    } catch (error) {
      setStatus(`Connection failed: ${error}`);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await ProjectService.getAll();
      setProjects(projectsData);
      setStatus(`Loaded ${projectsData.length} projects`);
    } catch (error: any) {
      setStatus(`Error loading projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!projectName) return;
    
    setLoading(true);
    try {
      const newProject = await ProjectService.create({
        name: projectName,
        description: 'Created from UI test'
      });
      
      setStatus(`Created project: ${newProject.name}`);
      setProjectName('');
      loadProjects();
    } catch (error: any) {
      setStatus(`Error creating project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    try {
      await ProjectService.delete(id);
      setStatus(`Deleted project ${id}`);
      loadProjects();
    } catch (error: any) {
      setStatus(`Error deleting project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Character Council</h1>
        <p className="text-gray-600 mb-6">Speculative Fiction Character Management</p>
        
        <div className="mb-6">
          <button 
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mr-2"
            disabled={loading}
          >
            Test Connection
          </button>
          
          <button 
            onClick={loadProjects}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            disabled={loading}
          >
            Refresh Projects
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectName">
            New Project Name
          </label>
          <div className="flex">
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow mr-2"
              placeholder="Enter project name"
              disabled={loading}
            />
            <button
              onClick={createProject}
              disabled={!projectName || loading}
              className={`font-bold py-2 px-4 rounded ${
                projectName && !loading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create
            </button>
          </div>
        </div>
        
        {status && (
          <div className="mb-6 text-sm text-gray-700 p-2 bg-gray-100 rounded">
            {status}
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Your Projects</h2>
          {loading ? (
            <p className="text-gray-500 italic">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 italic">No projects found. Create your first project!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map(project => (
                <li key={project.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                    <p className="text-xs text-gray-400">
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => alert(`View project ${project.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={loading}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => deleteProject(project.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;