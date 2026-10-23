import { useNavigate } from "react-router-dom";
import { HiOutlineSparkles } from "react-icons/hi2";

import Button from "@/ui/Button";

function PublisherAction() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate("/publications")}>
      <HiOutlineSparkles />
      Publier
    </Button>
  );
}

export default PublisherAction;
