'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import { parseConfig } from '@/lib/parsers';
import { useConfigStore, useTopologyStore } from '@/store';
import { generateId } from '@/lib/utils';

export function ConfigUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { configFiles, addConfigFile, updateParseResult, removeConfigFile } = useConfigStore();
  const { addRouter } = useTopologyStore();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await processFiles(files);
    e.target.value = ''; // Reset input
  }, []);

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const content = await file.text();
      const fileId = generateId();

      // Add to config store
      addConfigFile({
        id: fileId,
        name: file.name,
        content,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });

      // Parse the config
      const result = parseConfig(content);
      updateParseResult(fileId, result);

      // If successful, add router to topology
      if (result.success && result.router) {
        addRouter(result.router);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8',
          'transition-colors duration-200',
          'flex flex-col items-center justify-center gap-4',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        )}
      >
        <div className={cn(
          'p-4 rounded-full',
          isDragging ? 'bg-blue-100' : 'bg-gray-100'
        )}>
          <Upload className={cn(
            'w-8 h-8',
            isDragging ? 'text-blue-500' : 'text-gray-400'
          )} />
        </div>
        
        <div className="text-center">
          <p className="text-gray-700 font-medium">
            Drop router config files here
          </p>
          <p className="text-gray-500 text-sm mt-1">
            or click to browse
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept=".txt,.cfg,.conf"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className={cn(
            'px-4 py-2 rounded-md text-sm font-medium',
            'bg-white border border-gray-300 text-gray-700',
            'hover:bg-gray-50 transition-colors'
          )}>
            Browse Files
          </span>
        </label>

        <p className="text-xs text-gray-400">
          Supports: Yamaha RTX (.txt, .cfg)
        </p>
      </div>

      {/* Uploaded files list */}
      {configFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Uploaded Configs ({configFiles.length})
          </h3>
          <div className="space-y-2">
            {configFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-white border',
                  file.parseResult?.success
                    ? 'border-green-200'
                    : file.parseResult
                    ? 'border-red-200'
                    : 'border-gray-200'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  file.parseResult?.success
                    ? 'bg-green-100'
                    : file.parseResult
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                )}>
                  <FileText className={cn(
                    'w-5 h-5',
                    file.parseResult?.success
                      ? 'text-green-600'
                      : file.parseResult
                      ? 'text-red-600'
                      : 'text-gray-500'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatBytes(file.size)}</span>
                    {file.parseResult?.router && (
                      <>
                        <span>•</span>
                        <span>{file.parseResult.router.hostname}</span>
                      </>
                    )}
                  </div>
                </div>

                {file.parseResult && (
                  <div className="flex items-center gap-2">
                    {file.parseResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}

                <button
                  onClick={() => removeConfigFile(file.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
