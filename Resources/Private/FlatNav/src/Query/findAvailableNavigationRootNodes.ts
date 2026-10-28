import {fetchWithErrorHandling} from '@neos-project/neos-ui-backend-connector';
import {NodeAddress} from "../nodeAddress";

export async function findAvailableNavigationRootNodes(siteNodeAddress: NodeAddress): Promise<any> {
    const params = new URLSearchParams({
        'siteNodeAddress': siteNodeAddress.toJson(),
    });

    const jsonData = await fetchWithErrorHandling.withCsrfToken(csrfToken => ({
        url: `/neos/flatnav/availableNavigationRootNodes?${params.toString()}`,
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Flow-Csrftoken': csrfToken,
            'Content-Type': 'application/json'
        }
    }))
        .then(response => response.json());

    const nodeInfos = jsonData['nodeInfos'];

    return nodeInfos;
}
