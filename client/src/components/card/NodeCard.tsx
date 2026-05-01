import { Code, Diamond } from "lucide-react";

interface NodeCardProps {
  NodeType: "FILE" | "DIRECTORY";
  name: string;
}

export default function NodeCard(node: NodeCardProps) {
  return (
    <>
      <div className="aspect-square">
        <div className="flex justify-between">
          <div>{node.NodeType === "FILE" ? <Code /> : <Diamond />}</div>

          <div></div>
        </div>

        <div></div>

        <p>{node.name}</p>

        <div></div>
      </div>
    </>
  );
}
