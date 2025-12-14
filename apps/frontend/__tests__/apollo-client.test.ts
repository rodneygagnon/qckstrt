import {
  apolloClient,
  setDemoUser,
  getDemoUser,
  clearDemoUser,
  DemoUser,
} from "../lib/apollo-client";

describe("apollo-client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("apolloClient", () => {
    it("should be defined", () => {
      expect(apolloClient).toBeDefined();
    });

    it("should have a cache", () => {
      expect(apolloClient.cache).toBeDefined();
    });

    it("should have a link configured", () => {
      expect(apolloClient.link).toBeDefined();
    });
  });

  describe("setDemoUser", () => {
    it("should store user in localStorage", () => {
      const user: DemoUser = {
        id: "test-id",
        email: "test@example.com",
        roles: ["user"],
        department: "test",
        clearance: "public",
      };

      setDemoUser(user);

      const stored = localStorage.getItem("user");
      expect(stored).toBe(JSON.stringify(user));
    });
  });

  describe("getDemoUser", () => {
    it("should return null when no user is stored", () => {
      const user = getDemoUser();
      expect(user).toBeNull();
    });

    it("should return stored user", () => {
      const user: DemoUser = {
        id: "test-id",
        email: "test@example.com",
        roles: ["user"],
        department: "test",
        clearance: "public",
      };

      localStorage.setItem("user", JSON.stringify(user));

      const result = getDemoUser();
      expect(result).toEqual(user);
    });
  });

  describe("clearDemoUser", () => {
    it("should remove user from localStorage", () => {
      const user: DemoUser = {
        id: "test-id",
        email: "test@example.com",
        roles: ["user"],
        department: "test",
        clearance: "public",
      };

      localStorage.setItem("user", JSON.stringify(user));
      expect(localStorage.getItem("user")).not.toBeNull();

      clearDemoUser();

      expect(localStorage.getItem("user")).toBeNull();
    });
  });
});
