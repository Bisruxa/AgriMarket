from abc import ABC, abstractmethod

class InferenceService(ABC):
    """
    An abstract base class for inference services.
    It defines a common interface for loading models and making predictions.
    """
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = self._load_model()

    @abstractmethod
    def _load_model(self):
        """Loads the model from the specified path."""
        pass

    @abstractmethod
    def predict(self, data):
        """Makes a prediction based on the input data."""
        pass
