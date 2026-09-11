import { google, sheets_v4 } from "googleapis";
import { Feedback, FeedbackRecord } from "../types";
import {
  createFeedback,
  getAuthClient,
  updateFeedback,
} from "./googleSheetsUtils";
import { afterEach, describe, it, expect, vi } from "vitest";

const MOCK_AUTHORIZE = vi.fn().mockResolvedValue(undefined);
const MOCK_SHEETS = {
  spreadsheets: {
    values: {
      get: vi.fn(),
      append: vi.fn(),
      update: vi.fn(),
    },
  },
};

vi.mock("googleapis", async () => {
  const originalModule = await vi.importActual<typeof import("googleapis")>(
    "googleapis",
  );

  return {
    ...originalModule,
    google: {
      auth: {
        ...originalModule.google,
        JWT: vi.fn(function () {
          return { authorize: MOCK_AUTHORIZE };
        }),
      },
      sheets: vi.fn().mockImplementation(() => MOCK_SHEETS),
    },
  };
});

const MOCK_CLIENT_EMAIL = "hello@hello.com";
const MOCK_PRIVATE_KEY = "mockKey";
const TEST_SHEET_ID = "testSheetId";
const TEST_FEEDBACK_RECORD = {
  date: 12345,
  pageUrl: "example.com",
  rating: true,
  comment: "comment",
} as const satisfies FeedbackRecord;

const getMockSheetsClient = (): Promise<sheets_v4.Sheets> => {
  return getAuthClient(MOCK_CLIENT_EMAIL, MOCK_PRIVATE_KEY);
};

describe("google-sheets", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthClient", () => {
    it("successfully creates and authorizes a Google Sheets API client", async () => {
      const client = await getAuthClient(MOCK_CLIENT_EMAIL, MOCK_PRIVATE_KEY);
      expect(google.auth.JWT).toHaveBeenCalledWith(
        MOCK_CLIENT_EMAIL,
        undefined,
        MOCK_PRIVATE_KEY,
        ["https://www.googleapis.com/auth/spreadsheets"],
      );
      expect(MOCK_AUTHORIZE).toHaveBeenCalled();
      expect(google.sheets).toHaveBeenCalledWith({
        version: "v4",
        auth: { authorize: MOCK_AUTHORIZE },
      });
      expect(client).toEqual(MOCK_SHEETS);
    });

    it("throws an error if authorization fails", async () => {
      MOCK_AUTHORIZE.mockRejectedValueOnce(new Error("Failed to authorize"));
      await expect(
        getAuthClient(MOCK_CLIENT_EMAIL, MOCK_PRIVATE_KEY),
      ).rejects.toThrow(
        "Google Sheets API failed to authorize: Failed to authorize",
      );
    });
  });

  describe("createFeedback", () => {
    it("throws an error if creating a feedback row fails", async () => {
      MOCK_SHEETS.spreadsheets.values.append.mockRejectedValueOnce(
        new Error("Failed to create"),
      );
      await expect(
        createFeedback(
          await getMockSheetsClient(),
          TEST_SHEET_ID,
          TEST_FEEDBACK_RECORD.pageUrl,
          TEST_FEEDBACK_RECORD.rating,
        ),
      ).rejects.toThrow(
        "Google Sheets API failed to create feedback row: Failed to create",
      );
    });
  });

  describe("createFeedback", () => {
    it("throws an error if updating a feedback row fails", async () => {
      MOCK_SHEETS.spreadsheets.values.update.mockRejectedValueOnce(
        new Error("Failed to update"),
      );
      await expect(
        updateFeedback(
          await getMockSheetsClient(),
          TEST_SHEET_ID,
          1,
          Feedback.Comment,
          TEST_FEEDBACK_RECORD.comment,
        ),
      ).rejects.toThrow(
        "Google Sheets API failed to update feedback row: Failed to update",
      );
    });
  });
});
