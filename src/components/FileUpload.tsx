
import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Music, Video, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  onClose: () => void;
}

const FileUpload = ({ onFileUpload, onClose }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-400" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5 text-red-400" />;
    if (file.type.includes('text') || file.name.includes('.')) return <Code className="w-5 h-5 text-yellow-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Upload Files</h3>
        <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-300 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-gray-500 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">Drag and drop files here</p>
        <p className="text-sm text-gray-500 mb-4">Support for images, documents, audio, and more</p>
        
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="fileInput"
          accept="*/*"
        />
        <label
          htmlFor="fileInput"
          className="inline-block px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg cursor-pointer transition-colors"
        >
          Browse Files
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Selected Files:</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleUpload}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upload & Send
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFiles([])}
              className="border-gray-500 text-gray-300 hover:bg-white/10"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
