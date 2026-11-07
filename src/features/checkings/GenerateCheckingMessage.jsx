import { useEffect, useState } from "react";
import { evaluate } from "@/utils/helpers";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useDebounce } from "@/hooks/useDebounce";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import Row from "@/ui/Row";
import FormRow from "@/ui/FormRow";
import Button from "@/ui/Button";
import Radios from "@/ui/Radios";
import Textarea from "@/ui/Textarea";
import MailtoLink from "@/ui/MailtoLink";
import Heading from "@/ui/Heading";
import SpinnerMini from "@/ui/SpinnerMini";

import styled from "styled-components";

const StyledGenerateCheckingMessage = styled.div`
  width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & p {
    color: var(--color-grey-500);
    margin-bottom: 1.2rem;
  }
`;

const TextareaBody = styled(Textarea)`
  height: 20rem;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

const TEMPLATES = {
  fr: {
    simpleProblem: `Bonjour,\n\nJe souhaiterais savoir si le produit {{ NAME }} (code-barres {{ EAN }}) est adapté à un régime alimentaire végétalien.\nEn effet, il contient l'ingrédient suivant : "{{ PROBLEM_DESCRIPTION }}", un composant pouvant être d’origine animale ou végétale.\nPouvez-vous, s'il vous plait, m'indiquer s'il est d'origine animale ou non ?\n\nMerci d'avance pour votre retour.\n\nCordialement,\n{{ USERNAME }}`,
    multiProblem: `Bonjour,\n\nJe souhaiterais savoir si le produit {{ NAME }} (code-barres {{ EAN }}) est adapté à un régime alimentaire végétalien.\nEn effet, il contient les ingrédients suivants : "{{ PROBLEM_DESCRIPTION }}", des composants pouvant être d’origine animale ou végétale.\nPouvez-vous, s'il vous plait, m'indiquer s'ils sont d'origine animale ou non ?\n\nMerci d'avance pour votre retour.\n\nCordialement,\n{{ USERNAME }}`,
    processProblem: `Bonjour,\n\nJe souhaite savoir si le produit {{ NAME }} (code-barres {{ EAN }}) est adapté à un régime alimentaire végétalien.\nMa question porte sur le procédé utilisé pour {{ PROBLEM_DESCRIPTION }}.\nCe procédé implique-t-il l’utilisation d’animaux ou de sous-produits d’origine animale ?\n\nMerci par avance pour votre retour.\n\nCordialement,\n{{ USERNAME }}`,
  },
  en: {
    simpleProblem: `Hello,\n\nI would like to know whether the product {{ NAME }} (barcode {{ EAN }}) is suitable for a vegan diet.\nIt contains the following ingredient: "{{ PROBLEM_DESCRIPTION }}", which can be of either animal or plant origin.\nCould you please let me know whether it is of animal origin or not?\n\nThank you in advance for your reply.\n\nKind regards,\n{{ USERNAME }}`,
    multiProblem: `Hello,\n\nI would like to know whether the product {{ NAME }} (barcode {{ EAN }}) is suitable for a vegan diet.\nIt contains the following ingredients: "{{ PROBLEM_DESCRIPTION }}", which can be of either animal or plant origin.\nCould you please let me know whether they are of animal origin or not?\n\nThank you in advance for your reply.\n\nKind regards,\n{{ USERNAME }}`,
    processProblem: `Hello,\n\nI would like to know whether the product {{ NAME }} (barcode {{ EAN }}) is suitable for a vegan diet.\nMy question concerns the process used for {{ PROBLEM_DESCRIPTION }}.\nDoes this process involve the use of animals or animal by-products?\n\nThank you in advance for your reply.\n\nKind regards,\n{{ USERNAME }}`,
  },
};

const SUBJECTS = {
  fr: "Demande concernant le produit {{ NAME }} code barre : {{ EAN }}",
  en: "Request regarding the product {{ NAME }} barcode: {{ EAN }}",
};

const PLACEHOLDERS = {
  fr: { NAME: "[NOM DU PRODUIT]", PROBLEM_DESCRIPTION: "[PROBLÈMES]" },
  en: { NAME: "[PRODUCT NAME]", PROBLEM_DESCRIPTION: "[ISSUES]" },
};

function GenerateCheckingMessage({ product, onCloseModal }) {
  const debounce = useDebounce(3000);
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState("fr");
  const [template, setTemplate] = useState(null);
  const { isCopying, isCopied, error, copyToClipboard } = useCopyToClipboard();
  const { currentUser } = useCurrentUserContext();
  const { name, ean, problem_description, brand } = product;

  function getData(lang) {
    return {
      NAME: name || PLACEHOLDERS[lang].NAME,
      EAN: ean,
      PROBLEM_DESCRIPTION:
        problem_description?.toLowerCase() ||
        PLACEHOLDERS[lang].PROBLEM_DESCRIPTION,
      USERNAME: currentUser.nickname,
    };
  }

  function generate(lang, tpl) {
    if (!tpl) return;
    setBody(evaluate(TEMPLATES[lang][tpl], getData(lang)));
  }

  function handleGenerate(value) {
    setTemplate(value);
    generate(language, value);
  }

  function handleLanguageChange(value) {
    setLanguage(value);
    generate(value, template);
  }

  function handleCopy() {
    copyToClipboard(body);
  }

  useEffect(() => {
    debounce(() => {
      if (isCopied) onCloseModal?.();
    });
  }, [isCopied, onCloseModal, debounce]);

  return (
    <StyledGenerateCheckingMessage>
      <Heading as="h3">Générer un message de contact</Heading>
      <p>
        Cliquez sur le bouton correspondant au besoin pour générer le message.
      </p>
      <Row type="horizontal">
        <Radios
          id="language"
          defaultValue="fr"
          onChange={handleLanguageChange}
        >
          <Radios.RadioButton color="grey" value="fr" disabled={isCopying}>
            Français
          </Radios.RadioButton>
          <Radios.RadioButton color="grey" value="en" disabled={isCopying}>
            Anglais
          </Radios.RadioButton>
        </Radios>
      </Row>
      <Row type="horizontal">
        <Radios id="template" onChange={handleGenerate}>
          <Radios.RadioButton
            color="indigo"
            value="simpleProblem"
            disabled={isCopying}
          >
            Pour un ingrédient
          </Radios.RadioButton>
          <Radios.RadioButton
            color="indigo"
            value="multiProblem"
            disabled={isCopying}
          >
            Pour des ingrédients
          </Radios.RadioButton>
          <Radios.RadioButton
            color="indigo"
            value="processProblem"
            disabled={isCopying}
          >
            Pour le processus
          </Radios.RadioButton>
        </Radios>
      </Row>

      <Row type="vertical">
        <TextareaBody
          id="result"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isCopying}
        />
        {error && <Error>{error}</Error>}
      </Row>
      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isCopying}
        >
          Annuler
        </Button>
        <MailtoLink
          email={brand?.root_email || ""}
          subject={evaluate(SUBJECTS[language], getData(language))}
          body={body}
        >
          <Button
            disabled={!body || isCopying}
            onClick={() => onCloseModal?.()}
          >
            Ouvrir le client Mail
          </Button>
        </MailtoLink>
        {brand?.root_contact_form_url && (
          <a
            href={brand.root_contact_form_url}
            target="_blank"
            rel="noreferrer"
          >
            <Button disabled={isCopying}>Ouvrir le formulaire</Button>
          </a>
        )}
        <Button disabled={!body || isCopying || error} onClick={handleCopy}>
          {isCopying ? <SpinnerMini /> : isCopied ? "Copié ✅" : "Copier"}
        </Button>
      </FormRow>
    </StyledGenerateCheckingMessage>
  );
}

export default GenerateCheckingMessage;
