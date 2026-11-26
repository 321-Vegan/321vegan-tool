import { useForm } from "react-hook-form";

import { useBroadcastRecipients } from "./useBroadcasts";
import { useSendBroadcast } from "./useSendBroadcast";

import Button from "@/ui/Button";
import ConfirmAction from "@/ui/ConfirmAction";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Modal from "@/ui/Modal";
import Textarea from "@/ui/Textarea";

import { HiOutlinePaperAirplane } from "react-icons/hi2";
import styled from "styled-components";

// Same limits as the API
const TITLE_MAX = 100;
const BODY_MAX = 500;

const Preview = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  max-width: 40rem;
  padding: 1.2rem 1.4rem;
  border-radius: 1.8rem;
  background-color: var(--color-grey-100);
  box-shadow: var(--shadow-sm);

  & img {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 0.8rem;
    object-fit: contain;
    background-color: var(--color-grey-0);
  }

  & header {
    display: flex;
    justify-content: space-between;
    font-size: 1.2rem;
    color: var(--color-grey-500);
  }

  & strong {
    display: block;
    font-size: 1.4rem;
  }

  & p {
    font-size: 1.4rem;
    color: var(--color-grey-700);
    white-space: pre-line;
    /* The phones cut a long body after a few lines */
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Not a FormRow: those only right-align submit buttons
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1.2rem;
`;

const PreviewText = styled.div`
  flex: 1;
  min-width: 0;
`;

function BroadcastForm() {
  const { recipientCount } = useBroadcastRecipients();
  const { isSending, send } = useSendBroadcast();
  const { register, formState, handleSubmit, reset, watch, trigger } =
    useForm({ defaultValues: { title: "", body: "" } });
  const { errors } = formState;
  const title = watch("title");
  const body = watch("body");

  const recipients =
    recipientCount === undefined
      ? "tous les comptes"
      : `${recipientCount} compte${recipientCount > 1 ? "s" : ""}`;

  function onSubmit(data) {
    send(
      { title: data.title.trim(), body: data.body.trim() },
      { onSuccess: () => reset() },
    );
  }

  const rules = (max) => ({
    validate: (value) => value.trim() !== "" || "Ce champ est obligatoire",
    maxLength: { value: max, message: `${max} caractères maximum` },
  });

  return (
    <Modal>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRow
          label="Titre"
          hint={`${title.length} / ${TITLE_MAX}`}
          error={errors.title?.message}
        >
          <Input
            type="text"
            id="title"
            maxLength={TITLE_MAX}
            placeholder="Nouveauté dans l'app !"
            disabled={isSending}
            required
            {...register("title", rules(TITLE_MAX))}
          />
        </FormRow>

        <FormRow
          label="Texte"
          hint={`${body.length} / ${BODY_MAX}`}
          error={errors.body?.message}
        >
          <Textarea
            id="body"
            maxLength={BODY_MAX}
            placeholder="Ce que la notification annonce, en une ou deux phrases."
            disabled={isSending}
            required
            {...register("body", rules(BODY_MAX))}
          />
        </FormRow>

        <FormRow label="Aperçu" hint="À peu près comme sur un téléphone">
          <Preview id="preview">
            <img src="/logo-dark.png" alt="" />
            <PreviewText>
              <header>
                <span>321 Vegan</span>
                <span>maintenant</span>
              </header>
              <strong>{title || "Titre"}</strong>
              <p>{body || "Texte de la notification"}</p>
            </PreviewText>
          </Preview>
        </FormRow>

        <Actions>
          <Modal.Open opens="confirm-send">
            <SendButton
              trigger={trigger}
              disabled={isSending || recipientCount === 0}
              recipients={recipients}
            />
          </Modal.Open>
        </Actions>
      </Form>

      <Modal.Window name="confirm-send">
        <ConfirmAction
          variation="warning"
          title={`Envoyer « ${title.trim()} » ?`}
          message={`La notification part tout de suite à ${recipients} (push et centre de notifications de l'app). Elle ne peut pas être annulée.`}
          btnText="Envoyer"
          disabled={isSending}
          onConfirm={handleSubmit(onSubmit)}
        />
      </Modal.Window>
    </Modal>
  );
}

// Opens the confirmation ([onClick], from Modal.Open) only once the fields
// are valid: their errors show instead
function SendButton({ trigger, disabled, recipients, onClick }) {
  async function handleClick() {
    if (await trigger()) onClick();
  }

  return (
    <Button type="button" disabled={disabled} onClick={handleClick}>
      <HiOutlinePaperAirplane /> Envoyer à {recipients}
    </Button>
  );
}

export default BroadcastForm;
