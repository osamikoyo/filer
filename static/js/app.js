
// Create a file list item element
function createFileListItem(file) {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center py-4 border-b border-gray-700 hover:bg-gray-750 transition-colors duration-200 w-full group';
    
    // File info container
    const fileInfoDiv = document.createElement('div');
    fileInfoDiv.className = 'flex items-center space-x-3 flex-grow min-w-0';
    
    // File icon
    const fileIcon = document.createElement('div');
    const iconData = getFileIcon(file);
    fileIcon.innerHTML = iconData.svg;
    fileIcon.className = `${iconData.color} flex-shrink-0`;
    
    // File name
    const fileName = document.createElement('span');
    fileName.textContent = file;
    fileName.className = 'text-gray-300 truncate text-sm md:text-base font-medium';
    fileName.title = file; // Tooltip for full filename
    
    fileInfoDiv.appendChild(fileIcon);
    fileInfoDiv.appendChild(fileName);
    
    // Actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200';
    
    // Download button
    const downloadBtn = document.createElement('a');
    downloadBtn.href = `/download/${encodeURIComponent(file)}`;
    downloadBtn.className = 'download-btn inline-flex items-center justify-center p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all duration-200';
    downloadBtn.title = `Download ${file}`;
    downloadBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
    `;
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn inline-flex items-center justify-center p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200';
    deleteBtn.title = `Delete ${file}`;
    deleteBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
    `;
    
    // Add delete functionality with JavaScript
    deleteBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('Delete button clicked for file:', file);
        
        // Show confirmation dialog
        if (!confirm(`Вы уверены, что хотите удалить "${file}"?`)) {
            return;
        }
        
        try {
            // Show loading state
            deleteBtn.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            deleteBtn.disabled = true;
            
            const response = await fetch(`/delete/${encodeURIComponent(file)}`);
            
            if (response.ok) {
                const updatedFiles = await response.json();
                console.log('Delete successful, got updated files:', updatedFiles);
                
                // Update the file list
                const ul = document.getElementById('file-list-ul');
                if (ul) {
                    // Clear and rebuild the file list
                    ul.innerHTML = '';
                    if (updatedFiles.length === 0) {
                        ul.innerHTML = '<li class="text-gray-300 py-4 text-center">No files available</li>';
                    } else {
                        updatedFiles.forEach(fileName => {
                            if (fileName) {
                                const newLi = createFileListItem(fileName);
                                ul.appendChild(newLi);
                            }
                        });
                    }
                }
                
                showNotification('Файл успешно удалён!', 'success');
            } else {
                console.error('Delete failed with status:', response.status);
                showNotification('Ошибка удаления файла', 'error');
                
                // Restore delete button
                deleteBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                `;
                deleteBtn.disabled = false;
            }
        } catch (error) {
            console.error('Delete request failed:', error);
            showNotification('Ошибка соединения', 'error');
            
            // Restore delete button
            deleteBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            `;
            deleteBtn.disabled = false;
        }
    });
    
    // Add click handler for download feedback
    downloadBtn.addEventListener('click', function(e) {
        showDownloadFeedback(file);
    });
    
    actionsDiv.appendChild(downloadBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(fileInfoDiv);
    li.appendChild(actionsDiv);
    
    return li;
}

function renderFileList(event) {
    console.log('Rendering file list, response:', event.detail.xhr.responseText);
    if (event.detail.xhr.responseURL.includes('/list')) {
        const ul = document.getElementById('file-list-ul');
        if (!ul) {
            console.error('Element with ID "file-list-ul" not found in DOM');
            return;
        }
        ul.innerHTML = ''; // Clear previous content
        try {
            const files = JSON.parse(event.detail.xhr.responseText);
            console.log('Parsed files:', files);
            if (!Array.isArray(files)) {
                console.warn('Response is not an array:', files);
                ul.innerHTML = '<li class="text-gray-300 py-4">No files available</li>';
                return;
            }
            if (files.length === 0) {
                console.log('No files in response');
                ul.innerHTML = '<li class="text-gray-300 py-4 text-center">No files available</li>';
                return;
            }
            files.forEach(file => {
                if (file) {
                    console.log('Creating list item for file:', file);
                    const li = createFileListItem(file);
                    ul.appendChild(li);
                }
            });
        } catch (e) {
            console.error('Failed to parse JSON:', e, 'Response:', event.detail.xhr.responseText);
            ul.innerHTML = '<li class="text-red-400 py-4 text-center">Error loading file list</li>';
        }
    }
}

// Helper function to get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const imageSvg = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>';
    const documentSvg = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" /></svg>';
    const archiveSvg = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>';
    const videoSvg = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4.707 4.293a1 1 0 010 1.414L5.414 13a1 1 0 01-1.414-1.414L5.586 10 4 8.414A1 1 0 015.414 7L6.707 8.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>';
    const audioSvg = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 010 1.414A4.98 4.98 0 0117 12a4.98 4.98 0 01-1.343 4.243 1 1 0 01-1.414-1.414A2.98 2.98 0 0015 12a2.98 2.98 0 00-.757-2.829 1 1 0 011.414-1.414z" clip-rule="evenodd" /></svg>';
    
    const iconMap = {
        // Images
        'jpg': { svg: imageSvg, color: 'text-purple-400' },
        'jpeg': { svg: imageSvg, color: 'text-purple-400' },
        'png': { svg: imageSvg, color: 'text-purple-400' },
        'gif': { svg: imageSvg, color: 'text-purple-400' },
        'svg': { svg: imageSvg, color: 'text-purple-400' },
        'webp': { svg: imageSvg, color: 'text-purple-400' },
        'bmp': { svg: imageSvg, color: 'text-purple-400' },
        // Documents
        'pdf': { svg: documentSvg, color: 'text-red-400' },
        'doc': { svg: documentSvg, color: 'text-blue-400' },
        'docx': { svg: documentSvg, color: 'text-blue-400' },
        'txt': { svg: documentSvg, color: 'text-gray-400' },
        'md': { svg: documentSvg, color: 'text-gray-400' },
        'rtf': { svg: documentSvg, color: 'text-blue-400' },
        'xls': { svg: documentSvg, color: 'text-green-400' },
        'xlsx': { svg: documentSvg, color: 'text-green-400' },
        'ppt': { svg: documentSvg, color: 'text-orange-400' },
        'pptx': { svg: documentSvg, color: 'text-orange-400' },
        // Archives
        'zip': { svg: archiveSvg, color: 'text-yellow-400' },
        'rar': { svg: archiveSvg, color: 'text-yellow-400' },
        '7z': { svg: archiveSvg, color: 'text-yellow-400' },
        'tar': { svg: archiveSvg, color: 'text-yellow-400' },
        'gz': { svg: archiveSvg, color: 'text-yellow-400' },
        'bz2': { svg: archiveSvg, color: 'text-yellow-400' },
        // Videos
        'mp4': { svg: videoSvg, color: 'text-red-400' },
        'avi': { svg: videoSvg, color: 'text-red-400' },
        'mkv': { svg: videoSvg, color: 'text-red-400' },
        'mov': { svg: videoSvg, color: 'text-red-400' },
        'wmv': { svg: videoSvg, color: 'text-red-400' },
        'flv': { svg: videoSvg, color: 'text-red-400' },
        'webm': { svg: videoSvg, color: 'text-red-400' },
        // Audio
        'mp3': { svg: audioSvg, color: 'text-green-400' },
        'wav': { svg: audioSvg, color: 'text-green-400' },
        'flac': { svg: audioSvg, color: 'text-green-400' },
        'aac': { svg: audioSvg, color: 'text-green-400' },
        'ogg': { svg: audioSvg, color: 'text-green-400' },
        'm4a': { svg: audioSvg, color: 'text-green-400' },
    };
    
    return iconMap[ext] || { svg: documentSvg, color: 'text-gray-400' };
}

// Show download feedback to user
function showDownloadFeedback(filename) {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3 notification-enter transform transition-all duration-300 max-w-sm';
    notification.innerHTML = `
        <div class="flex-shrink-0">
            <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
        <div class="flex-grow min-w-0">
            <p class="font-semibold text-sm">Downloading...</p>
            <p class="text-green-100 text-xs truncate">${filename}</p>
        </div>
        <button class="flex-shrink-0 text-green-100 hover:text-white transition-colors duration-200" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add success animation after 1.5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.className = notification.className.replace('from-green-500 to-green-600', 'from-blue-500 to-blue-600');
            notification.innerHTML = `
                <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div class="flex-grow min-w-0">
                    <p class="font-semibold text-sm">Download started!</p>
                    <p class="text-blue-100 text-xs truncate">${filename}</p>
                </div>
                <button class="flex-shrink-0 text-blue-100 hover:text-white transition-colors duration-200" onclick="this.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
        }
    }, 1500);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Handle delete action feedback
document.addEventListener('htmx:afterRequest', function(event) {
    console.log('HTMX afterRequest event:', {
        url: event.detail.xhr.responseURL,
        status: event.detail.xhr.status,
        successful: event.detail.successful
    });
    
    if (event.detail.successful) {
        if (event.detail.xhr.responseURL.includes('/upload')) {
            console.log('Upload successful, triggering file list refresh');
            htmx.trigger('#file-list-ul', 'refresh');
            showNotification('Файл успешно загружен!', 'success');
        } else if (event.detail.xhr.responseURL.includes('/delete/')) {
            console.log('Delete successful');
            showNotification('Файл успешно удалён!', 'success');
        }
    } else {
        if (event.detail.xhr.responseURL.includes('/delete/')) {
            console.log('Delete failed');
            showNotification('Ошибка удаления файла', 'error');
        } else if (event.detail.xhr.responseURL.includes('/upload')) {
            showNotification('Ошибка загрузки файла', 'error');
        }
        console.error('HTMX request failed:', event.detail.xhr.status, event.detail.xhr.statusText);
    }
});

// Generic notification function
function showNotification(message, type = 'info') {
    const colors = {
        success: 'from-green-500 to-green-600',
        error: 'from-red-500 to-red-600',
        info: 'from-blue-500 to-blue-600',
        warning: 'from-yellow-500 to-yellow-600'
    };
    
    const icons = {
        success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 bg-gradient-to-r ${colors[type]} text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3 notification-enter transform transition-all duration-300 max-w-sm`;
    notification.innerHTML = `
        <div class="flex-shrink-0">
            ${icons[type]}
        </div>
        <span class="flex-grow text-sm font-medium">${message}</span>
        <button class="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}
