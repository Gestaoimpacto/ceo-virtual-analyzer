import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export function FileUpload({ onFileSelect, isLoading, error, success }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center gap-4",
          "bg-card/50 backdrop-blur-sm",
          isDragging && "border-primary bg-primary/5 glow-blue",
          !isDragging && !error && !success && "border-border hover:border-primary/50",
          error && "border-destructive bg-destructive/5",
          success && "border-emerald-500 bg-emerald-500/5 glow-emerald"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all",
          isDragging && "bg-primary/20",
          !isDragging && !error && !success && "bg-muted",
          error && "bg-destructive/20",
          success && "bg-emerald-500/20"
        )}>
          {error ? (
            <AlertCircle className="w-8 h-8 text-destructive" />
          ) : success ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          ) : selectedFile ? (
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          ) : (
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {isLoading ? (
            <>
              <p className="text-lg font-medium text-foreground">Processando arquivo...</p>
              <p className="text-sm text-muted-foreground mt-1">Analisando dados da empresa</p>
            </>
          ) : error ? (
            <>
              <p className="text-lg font-medium text-destructive">Erro ao processar arquivo</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </>
          ) : success ? (
            <>
              <p className="text-lg font-medium text-emerald-500">Arquivo processado com sucesso!</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedFile?.name}</p>
            </>
          ) : selectedFile ? (
            <>
              <p className="text-lg font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-foreground">
                Arraste seu arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou clique para selecionar
              </p>
            </>
          )}
        </div>

        {/* File input */}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {/* Supported formats */}
        {!selectedFile && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Formatos suportados: .xlsx, .xls, .csv
          </p>
        )}

        {/* Reset button */}
        {(selectedFile || error) && !isLoading && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
            }}
            className="mt-2"
          >
            Selecionar outro arquivo
          </Button>
        )}
      </div>
    </div>
  );
}
