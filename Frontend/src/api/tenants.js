import api from "./api";

export const updateTenant = (tenantId, data) => {
  return api.put(`/tenants/${tenantId}`, data);
};
