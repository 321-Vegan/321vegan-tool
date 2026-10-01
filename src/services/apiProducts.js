import { buildURLSearchParams } from "@/utils/helpers";
import { API_URL } from "@/utils/constants";
import axiosInstance from "./axiosInstance";

export async function countProducts(filters) {
  try {
    const params = new URLSearchParams();
    // FILTER
    if (filters) {
      filters.map((f) => params.append(f.field, f.value));
    }
    const res = await axiosInstance.get(
      [`${API_URL}/products/count`, params.toString()]
        .filter(Boolean)
        .join("?"),
    );
    const data = res.data;
    return data.total;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load products. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load products. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load products. Error: ${error.message}`);
    }
  }
}

export async function getProducts() {
  try {
    const res = await axiosInstance.get(`${API_URL}/products/`);
    const data = res.data;
    return { data: data, count: data?.length };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load products. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load products. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load products. Error: ${error.message}`);
    }
  }
}

export async function getSearchProducts({ filters, sortBy, page, size }) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/products/search`, params].filter(Boolean).join("?"),
    );
    const data = await res.data;
    return { data: data.items, count: data.total };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load searched products. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load searched products. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't load searched products. Error: ${error.message}`,
      );
    }
  }
}

export async function getProduct(id) {
  try {
    const res = await axiosInstance.get(`${API_URL}/products/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't find product #${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't find product #${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't find product #${id}. Error: ${error.message}`);
    }
  }
}

export async function getProductByEan(ean) {
  try {
    const res = await axiosInstance.get(`${API_URL}/products/ean/${ean}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't find product by ean #${ean}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't find product by ean #${ean}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't find product by ean #${ean}. Error: ${error.message}`,
      );
    }
  }
}

export async function createProduct(product) {
  try {
    const res = await axiosInstance.post(`${API_URL}/products/`, product);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 409)
        throw new Error(`Ce produit existe déjà.`);
      throw new Error(
        `Couldn't create product. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't create product. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't create product. Error: ${error.message}`);
    }
  }
}

export async function updateProduct(id, product) {
  try {
    const res = await axiosInstance.put(`${API_URL}/products/${id}`, product);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 409)
        throw new Error(`Ce produit existe déjà.`);
      throw new Error(
        `Couldn't update product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't update product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't update product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function deleteProduct(id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/products/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't delete product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function uploadProductImage(id, imageFile) {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await axiosInstance.post(
      `${API_URL}/products/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't upload image for product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't upload image for product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't upload image for product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function deleteProductImage(id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/products/${id}/image`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete image for product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete image for product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't delete image for product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function uploadProductBrandAnswer(id, imageFile) {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await axiosInstance.post(
      `${API_URL}/products/${id}/brand-answer`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't upload brand answer for product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't upload brand answer for product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't upload brand answer for product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function deleteProductBrandAnswer(id) {
  try {
    const res = await axiosInstance.delete(
      `${API_URL}/products/${id}/brand-answer`,
    );
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete brand answer for product # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete brand answer for product # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't delete brand answer for product # ${id}. Error: ${error.message}`,
      );
    }
  }
}

export async function getProductsForSelect(filters = []) {
  try {
    const sortBy = "name-asc";
    const page = 1;
    const size = 100;
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/products/search`, params].filter(Boolean).join("?"),
    );
    const data = await res.data;
    return {
      data: data.items.map((item) => ({
        value: item.id,
        label: item.name,
        ean: item.ean,
      })),
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load searched products for select. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load searched products for select. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't load searched products for select. Error: ${error.message}`,
      );
    }
  }
}
