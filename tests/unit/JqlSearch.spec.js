import { mount } from "@vue/test-utils";
import JqlSearch from "@/components/JqlSearch.vue";
import { describe, it, expect, vi } from "vitest";
import JiraClient from "@/services/jira.js";

vi.mock("@/services/jira.js");

describe("JqlSearch.vue", () => {
  it("renders q-input and q-table correctly", () => {
    const wrapper = mount(JqlSearch);
    expect(wrapper.find("input[type='text']").exists()).toBe(true);
    expect(wrapper.find("table").exists()).toBe(true);
  });

  it("performs JQL search and updates q-table with results", async () => {
    const mockSearchResults = {
      issues: [
        { id: "1", summary: "Issue 1", status: "Open", assignee: "User A" },
        { id: "2", summary: "Issue 2", status: "In Progress", assignee: "User B" },
      ],
      total: 2,
    };

    JiraClient.mockImplementation(() => ({
      searchIssues: vi.fn().mockResolvedValue(mockSearchResults),
    }));

    const wrapper = mount(JqlSearch);
    await wrapper.setData({ jqlQuery: "project = TEST" });
    await wrapper.vm.performSearch();

    expect(wrapper.vm.searchResults).toEqual(mockSearchResults.issues);
    expect(wrapper.vm.pagination.rowsNumber).toBe(mockSearchResults.total);
  });

  it("handles pagination correctly", async () => {
    const mockSearchResults = {
      issues: [
        { id: "1", summary: "Issue 1", status: "Open", assignee: "User A" },
        { id: "2", summary: "Issue 2", status: "In Progress", assignee: "User B" },
      ],
      total: 2,
    };

    JiraClient.mockImplementation(() => ({
      searchIssues: vi.fn().mockResolvedValue(mockSearchResults),
    }));

    const wrapper = mount(JqlSearch);
    await wrapper.setData({ jqlQuery: "project = TEST" });
    await wrapper.vm.performSearch();

    expect(wrapper.vm.pagination.page).toBe(1);
    expect(wrapper.vm.pagination.rowsPerPage).toBe(5);

    await wrapper.setData({ pagination: { page: 2, rowsPerPage: 5 } });
    await wrapper.vm.performSearch();

    expect(wrapper.vm.pagination.page).toBe(2);
  });

  it("stores and displays search history", async () => {
    const wrapper = mount(JqlSearch);
    await wrapper.setData({ jqlQuery: "project = TEST" });
    await wrapper.vm.performSearch();

    expect(wrapper.vm.searchHistory).toContain("project = TEST");

    await wrapper.setData({ selectedHistory: "project = TEST" });
    await wrapper.vm.selectHistory("project = TEST");

    expect(wrapper.vm.jqlQuery).toBe("project = TEST");
  });
});
