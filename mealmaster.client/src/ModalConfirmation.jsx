import ReactDom from "react-dom";

export default function ModalConfirmation({ onYes, onNo, children }) {
    return ReactDom.createPortal(
        <>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-3">
                        <p className="fw-semibold fs-5">
                            {children}
                        </p>

                        <div className="d-flex flex-row gap-2">
                            <button className="btn btn-danger"
                                    onClick={onYes}>
                                Yes
                            </button>

                            <button className="btn btn-secondary"
                                    onClick={onNo}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop show"></div>
        </>,
        document.getElementById("portal-root")
    );
}
