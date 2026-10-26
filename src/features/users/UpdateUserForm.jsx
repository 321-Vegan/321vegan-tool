import { useController, useForm } from "react-hook-form";
import { USER_ROLES } from "@/utils/constants";

import { useUpdateUser } from "./useUpdateUser";

import Button from "@/ui/Button";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Select from "@/ui/Select";
import Checkbox from "@/ui/Checkbox";

function UpdateUserForm({ userToUpdate, onCloseModal }) {
  const { id: updateId, ...updateValues } = userToUpdate;
  const { isUpdating, updateUser } = useUpdateUser();
  const { register, formState, handleSubmit, reset, control } = useForm({
    defaultValues: updateValues,
  });
  const { errors } = formState;

  const { field: roleField } = useController({
    name: "role",
    control,
    defaultValue: userToUpdate.role,
    rules: { required: "Ce champ est obligatoire" },
  });

  const { field: isActiveField } = useController({
    name: "is_active",
    control,
    defaultValue: userToUpdate.is_active,
  });

  function onSubmit(data) {
    const { friend_code: friendCode, ...newData } = data;
    const friendCodeChanged =
      (friendCode || "").trim().toUpperCase() !==
      (userToUpdate.friend_code || "");
    updateUser(
      {
        newData,
        id: updateId,
        friendCode: friendCodeChanged ? friendCode.trim() : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      }
    );
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow label="Rôle" error={errors.role?.message}>
        <Select
          name="role"
          onChange={roleField.onChange}
          isSearchable={true}
          defaultValue={[roleField.value]}
          defaultOptions={Object.entries(USER_ROLES).map(([key, o]) => {
            return { value: key, label: o.label };
          })}
          required={true}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Pseudo" error={errors.nickname?.message}>
        <Input
          type="text"
          id="nickname"
          {...register("nickname", { required: "Ce champ est obligatoire" })}
          disabled={isUpdating}
          required
        />
      </FormRow>

      <FormRow label="Adresse e-mail" error={errors.email?.message}>
        <Input
          type="email"
          id="email"
          {...register("email", {
            required: "Ce champ est obligatoire",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Adresse e-mail invalide",
            },
          })}
          disabled={isUpdating}
          required
        />
      </FormRow>

      <FormRow
        label="Code ami"
        hint="Mis en majuscules. Les codes réservés (ADMIN, 321VEGAN…) sont permis ici. Vide : un nouveau code est généré."
        error={errors.friend_code?.message}
      >
        <Input
          type="text"
          id="friend_code"
          {...register("friend_code", {
            pattern: {
              value: /^[A-Za-z0-9_]{4,16}$/,
              message: "De 4 à 16 lettres, chiffres ou « _ »",
            },
          })}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Compte actif ?" error={errors.is_active?.message}>
        <Checkbox
          name="is_active"
          onChange={isActiveField.onChange}
          onBlur={isActiveField.onBlur}
          checked={isActiveField.value}
          value={isActiveField.value}
          $inputRef={isActiveField.ref}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isUpdating}
        >
          Annuler
        </Button>
        <Button disabled={isUpdating}>Sauvegarder</Button>
      </FormRow>
    </Form>
  );
}

export default UpdateUserForm;
