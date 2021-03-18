const schema = {
  properties: {
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        unitPrice: {
          type: "number",
        },
      },
      required: ["name", "unitPrice"],
    },
  },
  required: ["body"],
};

export default schema;
