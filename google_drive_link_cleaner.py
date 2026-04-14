import tkinter as tk
from tkinter import messagebox
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
import webbrowser


def clean_drive_url(url: str) -> str:
    url = url.strip()
    parsed = urlparse(url)

    if "drive.google.com" not in parsed.netloc:
        raise ValueError("Không phải link Google Drive hợp lệ.")

    query_params = parse_qsl(parsed.query, keep_blank_values=True)
    filtered_params = [
        (k, v) for k, v in query_params
        if k.lower() not in {"range", "ump", "srfvp"}
    ]

    cleaned_query = urlencode(filtered_params, doseq=True)
    cleaned = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        cleaned_query,
        parsed.fragment
    ))

    while "&&" in cleaned:
        cleaned = cleaned.replace("&&", "&")
    cleaned = cleaned.replace("?&", "?").rstrip("?&")

    return cleaned


class DriveCleanerApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Google Drive Link Cleaner")
        self.root.geometry("620x320")
        self.root.minsize(560, 280)

        frame = tk.Frame(root, padx=16, pady=16)
        frame.pack(fill="both", expand=True)

        title = tk.Label(
            frame,
            text="Google Drive Link Cleaner",
            font=("Segoe UI", 16, "bold")
        )
        title.pack(anchor="w")

        desc = tk.Label(
            frame,
            text="Bấm nút để dán từ clipboard và tự động mở link, hoặc Ctrl+V trực tiếp vào ô.",
            font=("Segoe UI", 10),
            justify="left"
        )
        desc.pack(anchor="w", pady=(6, 12))

        self.text = tk.Text(frame, height=6, wrap="word", font=("Consolas", 11))
        self.text.pack(fill="both", expand=True)
        self.text.focus_set()

        self.text.bind("<Control-v>", self.on_paste)
        self.text.bind("<Control-V>", self.on_paste)
        self.text.bind("<Command-v>", self.on_paste)

        btn_row = tk.Frame(frame)
        btn_row.pack(fill="x", pady=(12, 8))

        paste_open_btn = tk.Button(
            btn_row,
            text="Dán và mở link ngay",
            command=self.paste_and_open,
            padx=12,
            pady=8
        )
        paste_open_btn.pack(side="left")

        clean_btn = tk.Button(
            btn_row,
            text="Làm sạch và mở link",
            command=self.clean_and_open,
            padx=12,
            pady=8
        )
        clean_btn.pack(side="left", padx=(8, 0))

        clear_btn = tk.Button(
            btn_row,
            text="Xóa ô nhập",
            command=self.clear_text,
            padx=12,
            pady=8
        )
        clear_btn.pack(side="right")

        self.status_var = tk.StringVar(value="Sẵn sàng.")
        status = tk.Label(
            frame,
            textvariable=self.status_var,
            anchor="w",
            fg="#333333"
        )
        status.pack(fill="x", pady=(6, 0))

    def get_text(self) -> str:
        return self.text.get("1.0", "end").strip()

    def set_text(self, value: str) -> None:
        self.text.delete("1.0", "end")
        self.text.insert("1.0", value)

    def clear_text(self) -> None:
        self.text.delete("1.0", "end")
        self.status_var.set("Đã xóa nội dung.")

    def paste_and_open(self) -> None:
        try:
            text = self.root.clipboard_get()
        except tk.TclError:
            messagebox.showerror("Lỗi", "Clipboard đang trống hoặc không thể truy cập.")
            return

        if not text.strip():
            messagebox.showwarning("Clipboard trống", "Không có nội dung trong clipboard.")
            return

        self.set_text(text)
        self.clean_and_open()

    def on_paste(self, event=None):
        self.root.after(100, self.try_auto_process)

    def try_auto_process(self):
        text = self.get_text()
        if text and "drive.google.com" in text:
            self.clean_and_open(auto=True)

    def clean_and_open(self, auto: bool = False) -> None:
        raw_url = self.get_text()

        if not raw_url:
            messagebox.showwarning("Thiếu link", "Hãy dán link Google Drive trước.")
            return

        try:
            cleaned = clean_drive_url(raw_url)
        except ValueError as e:
            if not auto:
                messagebox.showerror("Link không hợp lệ", str(e))
            self.status_var.set("Link không hợp lệ.")
            return
        except Exception as e:
            messagebox.showerror("Lỗi", f"Không thể xử lý link: {e}")
            self.status_var.set("Xử lý thất bại.")
            return

        self.set_text(cleaned)
        webbrowser.open_new_tab(cleaned)
        self.status_var.set("Đã làm sạch và mở link trong trình duyệt.")


def main():
    root = tk.Tk()
    app = DriveCleanerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
