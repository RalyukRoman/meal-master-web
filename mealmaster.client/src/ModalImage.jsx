import { useState } from "react";
import ReactDom from "react-dom";

export default function ModalImage({ onTake, onClose }) {
    const [image, setImage] = useState(null);

    const close = () => {
        setImage(null);
        onClose();
    }

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        onTake(image || null);
        setImage(null);
        onClose();
    }

    return ReactDom.createPortal(
        <>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-3">
                        <form onSubmit={handleSubmit}>
                            <input name="image"
                                   type="file"
                                   accept="image/*"
                                   className="form-control mb-3"
                                   onChange={handleFileChange} />

                            {image && (
                                <img src={URL.createObjectURL(image)}
                                    alt="preview"
                                    className="img-thumbnail mt-2 mb-3" />
                            )}

                            <div className="d-flex flex-row gap-2">
                                <button className="btn btn-primary"
                                        type="submit">
                                    Add
                                </button>

                                <button className="btn btn-secondary"
                                        type="button"
                                        onClick={close}>
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop show"></div>
        </>,
        document.getElementById("portal-root")
    );
}
