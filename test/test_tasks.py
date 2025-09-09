def test_create_task(client, auth_headers):
    """Test creating a new task with authorization."""
    response = client.post(
        "/tasks/",
        json={"title": "Test Task", "description": "This is a test task"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["completed"] is False


def test_get_tasks(client, auth_headers):
    """Test retrieving tasks list with authorization."""
    response = client.get("/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_read_task(client, auth_headers):
    """Test reading a single task with authorization."""
    # Create first
    response = client.post(
        "/tasks/",
        json={"title": "Single Task"},
        headers=auth_headers,
    )
    task_id = response.json()["id"]

    # Read it
    response = client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Single Task"

def test_read_tasks(client, auth_headers):
    """Test reading all tasks with authorization."""
    # Optionally clear existing tasks before running this test
    # (Assuming an endpoint exists to delete all tasks for test isolation)
    client.delete("/tasks/", headers=auth_headers)

    task_ids = []
    for i in range(1, 5):
        response = client.post(
            "/tasks/",
            json={"title": f"task {i}"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        task_ids.append(response.json()["id"])

    response = client.get("/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Only check tasks created in this test
    filtered_tasks = [task for task in data if task["id"] in task_ids]
    titles = [task["title"] for task in filtered_tasks]
    for i in range(1, 5):
        assert f"task {i}" in titles

def test_update_task(client, auth_headers):
    """Test updating a task."""
    # Create first
    response = client.post(
        "/tasks/",
        json={"title": "Old Title"},
        headers=auth_headers,
    )
    task_id = response.json()["id"]

    # Update it
    response = client.put(
        f"/tasks/{task_id}",
        json={"title": "Updated Title", "completed": True},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["completed"] is True


def test_delete_task(client, auth_headers):
    """Test deleting a task."""
    # Create first
    response = client.post(
        "/tasks/",
        json={"title": "Task to Delete"},
        headers=auth_headers,
    )
    task_id = response.json()["id"]

    # Delete it
    response = client.delete(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    # Ensure it's gone
    response = client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404
