
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyableCodeProps {
  code: string;
}

const CopyableCode = ({ code }: CopyableCodeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <code className="flex-1 bg-olimpics-background border border-olimpics-green-primary/20 rounded p-2 text-sm overflow-x-auto">
        {code}
      </code>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default CopyableCode;
