const schema = {
  properties: {
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        id: {
          type: "string",
        },
      },
      required: ["name", "id"],
    },
  },
  required: ["body"],
};

export default schema;
