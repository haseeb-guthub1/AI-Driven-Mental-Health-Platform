import os
from unittest.mock import patch

from django.test import SimpleTestCase

from .ollama_response_generator import OllamaResponseGenerator


class OllamaResponseGeneratorTests(SimpleTestCase):
    def test_reads_model_and_url_from_environment(self):
        with patch.dict(os.environ, {"OLLAMA_MODEL_NAME": "phi3:mini", "OLLAMA_URL": "http://127.0.0.1:11435"}, clear=False):
            with patch.object(OllamaResponseGenerator, "_verify_ollama_connection", return_value=True):
                generator = OllamaResponseGenerator()

        self.assertEqual(generator.model_name, "phi3:mini")
        self.assertEqual(generator.ollama_url, "http://127.0.0.1:11435")
        self.assertEqual(generator.api_endpoint, "http://127.0.0.1:11435/api/chat")
