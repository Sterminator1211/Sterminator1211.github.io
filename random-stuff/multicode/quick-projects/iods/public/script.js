const API =
    "https://YOUR_VERCEL_URL.vercel.app/api";

async function loadLatest() {

    const response =
        await fetch(`${API}/latest`);

    const data =
        await response.json();

    document
        .getElementById("latest")
        .textContent =
            JSON.stringify(
                data,
                null,
                2
            );

}

async function loadUploads() {

    const response =
        await fetch(`${API}/list`);

    const uploads =
        await response.json();

    document
        .getElementById("count")
        .textContent =
            uploads.length;

    const list =
        document.getElementById("uploads");

    list.innerHTML = "";

    uploads.forEach(upload => {

        const li =
            document.createElement("li");

        const button =
            document.createElement("button");

        button.textContent =
            "Open";

        button.onclick =
            async () => {

                const r =
                    await fetch(
                        `${API}/file?name=${encodeURIComponent(upload.filename)}`
                    );

                const json =
                    await r.json();

                document
                    .getElementById("latest")
                    .textContent =
                        JSON.stringify(
                            json,
                            null,
                            2
                        );

            };

        li.textContent =
            upload.filename;

        li.appendChild(button);

        list.appendChild(li);

    });

}

loadLatest();
loadUploads();
