export type HttpFileOptions = {
  /**
   * The filename for the Content-Disposition header.
   * Required for raw data (Buffer, String), optional for File objects.
   */
  filename?: string;

  /**
   * The MIME type.
   * Defaults to 'application/octet-stream' or infers from File/Blob.
   */
  contentType?: string;

  /**
   * Last modified date (sets Last-Modified header).
   */
  lastModified?: Date;
};

export type HttpStreamOptions = {
  /**
   * The filename for download (Content-Disposition).
   */
  filename?: string;

  /**
   * The MIME type.
   */
  contentType?: string;

  /**
   * The total size of the stream in bytes (sets Content-Length).
   */
  totalSize?: number;

  /**
   * The starting byte offset (useful for range requests / partial content).
   * Note: The runtime needs to support seeking/skipping for this to work effectively.
   */
  offset?: number;

  /**
   * The end byte offset.
   */
  end?: number;
};