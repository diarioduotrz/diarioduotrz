import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ExpandableDescriptionProps = {
  text: string;
  previewLength?: number;
};

const ExpandableDescription = ({
  text,
  previewLength = 80,
}: ExpandableDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);

  // Determina se deve mostrar o botão baseado no comprimento do texto
  // Usamos line-clamp-1 para garantir visualmente apenas uma linha
  const shouldShowButton = text.length > previewLength;

  return (
    <div className="mt-5 max-w-3xl">
      <p 
        className={`text-base leading-8 text-white/62 sm:text-lg transition-all duration-300 ${
          !expanded ? "line-clamp-1" : ""
        }`}
      >
        {text}
      </p>

      {shouldShowButton ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          {expanded ? (
            <>
              Recolher
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              Expandir
              <ChevronDown size={16} />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
};

export default ExpandableDescription;
