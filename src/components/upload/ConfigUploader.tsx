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
            ? 'border-yellow-400 bg-yellow-400/10'
            : 'border-white/30 hover:border-white/50 bg-white/5'
        )}
      >
        <div className={cn(
          'p-4 rounded-full',
          isDragging ? 'bg-yellow-400/20' : 'bg-white/10'
        )}>
          <Upload className={cn(
            'w-8 h-8',
            isDragging ? 'text-yellow-400' : 'text-white/60'
          )} />
        </div>
        
        <div className="text-center">
          <p className="text-white font-medium">
            Drop router config files here
          </p>
          <p className="text-white/60 text-sm mt-1">
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
            'bg-white/10 border border-white/30 text-white',
            'hover:bg-white/20 transition-colors'
          )}>
            Browse Files
          </span>
        </label>

        <p className="text-xs text-white/40">
          Supports: Yamaha RTX (.txt, .cfg)
        </p>
      </div>

      {/* Uploaded files list */}
      {configFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white">
            Uploaded Configs ({configFiles.length})
          </h3>
          <div className="space-y-2">
            {configFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'border',
                  file.parseResult?.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : file.parseResult
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-white/5 border-white/20'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  file.parseResult?.success
                    ? 'bg-green-500/20'
                    : file.parseResult
                    ? 'bg-red-500/20'
                    : 'bg-white/10'
                )}>
                  <FileText className={cn(
                    'w-5 h-5',
                    file.parseResult?.success
                      ? 'text-green-400'
                      : file.parseResult
                      ? 'text-red-400'
                      : 'text-white/60'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
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
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}

                <button
                  onClick={() => removeConfigFile(file.id)}
                  className="p-1 text-white/40 hover:text-white rounded"
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
